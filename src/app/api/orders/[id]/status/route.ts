import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { OrderStatus } from '@/types';
import { sendStudentStatusUpdate } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';
import { sanitizeIdentifier } from '@/lib/sanitize';

export const runtime = 'nodejs';

const VALID_STATUSES: OrderStatus[] = [
  'pending',
  'accepted',
  'printing',
  'ready',
  'completed',
  'cancelled',
];

interface Props {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const cleanId = sanitizeIdentifier(id, 64);

    const supabase = await createClient();

    // 1. Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Verify admin role in database
    const { data: adminRecord } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!adminRecord) {
      return NextResponse.json({ error: 'Forbidden: Admin privileges required.' }, { status: 403 });
    }

    // Rate limiting for admin actions
    const rateLimit = checkRateLimit(`admin-status:${user.id}`, 60, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Admin action rate limit reached. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // 3. Update order status
    const { data: updatedOrder, error: updateError } = await adminClient
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cleanId)
      .select('*, profiles(*)')
      .single();

    if (updateError || !updatedOrder) {
      console.error('Failed to update status:', updateError);
      return NextResponse.json({ error: 'Order not found or update failed.' }, { status: 500 });
    }

    // 4. Send student notification if status changed
    try {
      const studentId = (updatedOrder as any).student_id;
      const { data: authUser } = await adminClient.auth.admin.getUserById(studentId);
      const studentEmail = authUser?.user?.email;
      const studentName = (updatedOrder as any).profiles?.full_name || 'Student';

      if (studentEmail) {
        sendStudentStatusUpdate({
          email: studentEmail,
          studentName,
          orderNumber: (updatedOrder as any).order_number,
          status,
        }).catch(console.error);
      }
    } catch (notifErr) {
      console.warn('Could not dispatch status notification:', notifErr);
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (err: any) {
    console.error('Status update error:', err);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const cleanId = sanitizeIdentifier(id, 64);

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify student ownership or admin status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, updated_at, total_amount, order_number, created_at')
      .eq('id', cleanId)
      .maybeSingle();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let queueAhead = 0;
    if (['pending', 'accepted', 'printing'].includes(order.status)) {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'accepted', 'printing'])
        .lt('created_at', order.created_at);
      queueAhead = count ?? 0;
    }

    return NextResponse.json({
      status: order.status,
      updatedAt: order.updated_at,
      orderNumber: order.order_number,
      queueAhead,
    });
  } catch (err: any) {
    console.error('Status check error:', err);
    return NextResponse.json({ error: 'Failed to check order status' }, { status: 500 });
  }
}
