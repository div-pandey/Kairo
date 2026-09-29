import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { initiatePhonePePayment, generateMerchantTxnId } from '@/lib/phonepe';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 5 payment initiations per minute per user
    const rateLimit = checkRateLimit(`payment:${user.id}`, 5, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many payment attempts. Retry in ${rateLimit.retryAfterSeconds}s.` },
        { status: 429 }
      );
    }

    const { orderId } = await req.json();
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Fetch the order — verify ownership
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .select('id, total_amount, status, payment_status, student_id')
      .eq('id', orderId)
      .eq('student_id', user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.payment_status === 'paid') {
      return NextResponse.json({ error: 'This order has already been paid.' }, { status: 409 });
    }

    if (order.status === 'cancelled') {
      return NextResponse.json({ error: 'Cannot pay for a cancelled order.' }, { status: 400 });
    }

    // Get student phone number if available
    const { data: profile } = await adminClient
      .from('profiles')
      .select('phone_number')
      .eq('id', user.id)
      .maybeSingle();

    const merchantTransactionId = generateMerchantTxnId();

    // Create payment record in DB
    const { error: paymentInsertError } = await adminClient
      .from('payments')
      .insert({
        order_id:               orderId,
        student_id:             user.id,
        merchant_transaction_id: merchantTransactionId,
        amount:                 Math.round(order.total_amount * 100), // paise
        status:                 'initiated',
      });

    if (paymentInsertError) {
      console.error('Failed to create payment record:', paymentInsertError);
      return NextResponse.json({ error: 'Failed to initiate payment. Please try again.' }, { status: 500 });
    }

    // Call PhonePe API
    const result = await initiatePhonePePayment(
      merchantTransactionId,
      orderId,
      order.total_amount,
      user.id,
      profile?.phone_number ?? undefined
    );

    if (!result.success || !result.redirectUrl) {
      // Update payment status to failed
      await adminClient
        .from('payments')
        .update({ status: 'failed', initiate_response: result.rawResponse ?? { error: result.error } })
        .eq('merchant_transaction_id', merchantTransactionId);

      return NextResponse.json(
        { error: result.error ?? 'Payment gateway unavailable. Please try again.' },
        { status: 502 }
      );
    }

    // Update payment with initiate response
    await adminClient
      .from('payments')
      .update({ status: 'pending', initiate_response: result.rawResponse })
      .eq('merchant_transaction_id', merchantTransactionId);

    return NextResponse.json({
      success:               true,
      redirectUrl:           result.redirectUrl,
      merchantTransactionId,
    });
  } catch (err) {
    console.error('Payment initiation error:', err);
    return NextResponse.json({ error: 'Unexpected error during payment initiation.' }, { status: 500 });
  }
}
