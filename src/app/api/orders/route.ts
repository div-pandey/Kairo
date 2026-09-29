import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PRICING, MAX_FILES_PER_ORDER, MAX_COPIES, MAX_FILE_SIZE_BYTES } from '@/lib/constants';
import { sendAdminOrderNotification, sendStudentOrderConfirmation } from '@/lib/email';
import { sanitizeText, sanitizeFileName, clampInt } from '@/lib/sanitize';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

interface OrderItemInput {
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  pageCount?: number;
  pageCountSource?: 'auto' | 'manual' | 'estimated';
  colourMode: 'bw' | 'colour';
  printSide?: 'separate_pages' | 'both_sides';
  copies: number;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    // ── Rate Limiting (15 orders per 5 minutes per user) ───────────────────
    const rateLimit = checkRateLimit(`order:${user.id}`, 15, 5 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Order rate limit reached. Please wait ${rateLimit.retryAfterSeconds} seconds before placing another requisition.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const items: OrderItemInput[] = body.items;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one file.' }, { status: 400 });
    }

    if (items.length > MAX_FILES_PER_ORDER) {
      return NextResponse.json(
        { error: `An order cannot exceed ${MAX_FILES_PER_ORDER} files at a time.` },
        { status: 400 }
      );
    }

    // 1. Fetch current live pricing securely on server
    const { data: pricingData } = await supabase
      .from('pricing_config')
      .select('bw_price_per_page, colour_price_per_page')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    const bwPrice = pricingData ? Number(pricingData.bw_price_per_page) : PRICING.bw;
    const colourPrice = pricingData ? Number(pricingData.colour_price_per_page) : PRICING.colour;

    // 2. Validate, sanitize, and calculate item totals securely on server
    let grandTotal = 0;
    const sanitizedItems = [];

    for (const item of items) {
      const pageCount = clampInt(item.pageCount, 1, 2000, 1);
      const copies = clampInt(item.copies, 1, MAX_COPIES, 1);
      const isColour = item.colourMode === 'colour';
      const pricePerPage = isColour ? colourPrice : bwPrice;
      const itemTotal = pageCount * copies * pricePerPage;

      grandTotal += itemTotal;

      const safeFileName = sanitizeFileName(item.fileName, 120);
      const safeFileType = sanitizeText(item.fileType, 60) || 'application/octet-stream';
      // Ensure file path belongs to current user
      const rawFilePath = String(item.filePath || '');
      const safeFilePath = rawFilePath.startsWith(`${user.id}/`)
        ? rawFilePath
        : `${user.id}/${safeFileName}`;

      const printSide = item.printSide === 'both_sides' ? 'both_sides' : 'separate_pages';

      sanitizedItems.push({
        file_name: safeFileName,
        file_path: safeFilePath,
        file_size: clampInt(item.fileSize, 0, MAX_FILE_SIZE_BYTES, 0),
        file_type: safeFileType,
        page_count: pageCount,
        page_count_source: item.pageCountSource === 'auto' ? 'auto' : 'manual',
        colour_mode: isColour ? ('colour' as const) : ('bw' as const),
        print_side: printSide,
        copies: copies,
        price_per_page: pricePerPage,
        item_total: itemTotal,
      });
    }

    const adminClient = createAdminClient();

    // 3. Generate fallback order number
    const fallbackOrderNumber = `KAI-${Math.floor(1000 + Math.random() * 9000)}`;
    const sanitizedNotes = body.notes ? sanitizeText(body.notes, 500) : null;

    // 4. Create Order
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .insert({
        student_id: user.id,
        status: 'pending',
        total_amount: grandTotal,
        notes: sanitizedNotes,
        order_number: fallbackOrderNumber,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Failed to create order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create requisition. Please try again.' },
        { status: 500 }
      );
    }

    // 5. Create Order Items
    const itemsToInsert = sanitizedItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    let { error: itemsError } = await adminClient
      .from('order_items')
      .insert(itemsToInsert);

    // Graceful fallback if print_side column hasn't been added via migration yet
    if (itemsError && itemsError.message?.toLowerCase().includes('print_side')) {
      const fallbackItems = itemsToInsert.map(({ print_side, ...rest }) => rest);
      const retryResult = await adminClient
        .from('order_items')
        .insert(fallbackItems);
      itemsError = retryResult.error;
    }

    if (itemsError) {
      console.error('Failed to insert order items:', itemsError);
      // Clean up order to prevent orphaned empty orders
      await adminClient.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: 'Failed to save requisition items.' },
        { status: 500 }
      );
    }

    // 6. Trigger notifications (non-blocking)
    const { data: profile } = await adminClient
      .from('profiles')
      .select('full_name, kcc_id')
      .eq('id', user.id)
      .maybeSingle();

    const studentName = profile?.full_name || 'Student';
    const studentKccId = profile?.kcc_id || 'KCC';

    sendAdminOrderNotification({
      orderId: order.id,
      orderNumber: order.order_number,
      studentName,
      studentKccId,
      totalAmount: grandTotal,
      fileCount: sanitizedItems.length,
    }).catch(console.error);

    if (user.email) {
      sendStudentOrderConfirmation({
        email: user.email,
        studentName,
        orderNumber: order.order_number,
        orderId: order.id,
        totalAmount: grandTotal,
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      totalAmount: grandTotal,
    });
  } catch (err: any) {
    console.error('Order creation exception:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while placing your order. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // IDOR protection: strictly enforce student_id = auth user
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      return NextResponse.json({ error: 'Could not retrieve orders' }, { status: 500 });
    }

    return NextResponse.json({ orders });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
