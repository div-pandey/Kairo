import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sanitizeIdentifier } from '@/lib/sanitize';

export const runtime = 'nodejs';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const cleanId = sanitizeIdentifier(id, 64);

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify order belongs to student
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, student_id, status, order_number')
      .eq('id', cleanId)
      .eq('student_id', user.id)
      .maybeSingle();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only pending orders can be cancelled by students
    if (order.status !== 'pending') {
      return NextResponse.json(
        {
          error: `Order cannot be cancelled because it is already "${order.status}". Only pending orders can be cancelled.`,
        },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();
    const { data: updatedOrder, error: updateError } = await adminClient
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', cleanId)
      .select()
      .single();

    if (updateError || !updatedOrder) {
      return NextResponse.json({ error: 'Could not cancel order' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      order: updatedOrder,
    });
  } catch (err: any) {
    console.error('Order cancellation error:', err);
    return NextResponse.json({ error: 'Failed to process cancellation' }, { status: 500 });
  }
}
