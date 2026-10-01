import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { decodePhonePeCallback, verifyCallbackChecksum } from '@/lib/phonepe';

export const runtime = 'nodejs';

// PhonePe POSTs to this endpoint after payment completion
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { response?: string };
    const xVerify = req.headers.get('x-verify') ?? '';

    // Decode the base64 response payload
    const { valid, payload, error: decodeError } = decodePhonePeCallback(body);
    if (!valid || !payload) {
      console.error('PhonePe callback decode failed:', decodeError);
      return NextResponse.json({ error: 'Invalid callback payload' }, { status: 400 });
    }

    // Verify the checksum signature
    if (body.response) {
      const checksumValid = verifyCallbackChecksum(body.response, xVerify);
      if (!checksumValid) {
        console.error('PhonePe callback checksum mismatch');
        return NextResponse.json({ error: 'Checksum verification failed' }, { status: 401 });
      }
    }

    const merchantTransactionId = payload.merchantTransactionId as string;
    const txnState = (payload.state ?? payload.code ?? 'UNKNOWN') as string;

    const adminClient = createAdminClient();

    // Fetch payment record
    const { data: payment, error: paymentFetchError } = await adminClient
      .from('payments')
      .select('id, order_id, student_id, status')
      .eq('merchant_transaction_id', merchantTransactionId)
      .maybeSingle();

    if (paymentFetchError || !payment) {
      console.error('Payment not found for txn:', merchantTransactionId);
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    // Idempotency: if already marked success/failed, skip
    if (payment.status === 'success' || payment.status === 'failed') {
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    const isSuccess = txnState === 'COMPLETED';
    const newStatus = isSuccess ? 'success' : 'failed';

    const { error: updatePaymentError } = await adminClient
      .from('payments')
      .update({
        status:                 newStatus,
        phonepe_transaction_id: payload.transactionId as string | undefined,
        completed_at:           new Date().toISOString(),
        callback_payload:       payload,
      })
      .eq('merchant_transaction_id', merchantTransactionId);

    if (updatePaymentError) {
      console.error('Failed to update payment status:', updatePaymentError);
      return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
    }

    // Update the order payment_status
    if (isSuccess) {
      await adminClient
        .from('orders')
        .update({ payment_status: 'paid' })
        .eq('id', payment.order_id);
    } else {
      await adminClient
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('id', payment.order_id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PhonePe callback error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
