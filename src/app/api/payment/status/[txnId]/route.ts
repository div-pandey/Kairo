import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkPhonePePaymentStatus } from '@/lib/phonepe';

export const runtime = 'nodejs';

interface Props {
  params: Promise<{ txnId: string }>;
}

export async function GET(_req: NextRequest, { params }: Props) {
  try {
    const { txnId } = await params;

    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    const { data: payment, error: paymentError } = await adminClient
      .from('payments')
      .select('id, order_id, student_id, status, amount, phonepe_transaction_id, initiated_at, completed_at')
      .eq('merchant_transaction_id', txnId)
      .eq('student_id', user.id)
      .maybeSingle();

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status === 'success' || payment.status === 'failed' || payment.status === 'cancelled') {
      return NextResponse.json({
        status:                payment.status,
        merchantTransactionId: txnId,
        phonepeTransactionId:  payment.phonepe_transaction_id,
        amount:                payment.amount,
        orderId:               payment.order_id,
      });
    }

    const phonePeStatus = await checkPhonePePaymentStatus(txnId);
    // v2 API uses COMPLETED (not SUCCESS) and FAILED (not FAILURE)
    const isSuccess = phonePeStatus.status === 'COMPLETED';
    const isFailed  = phonePeStatus.status === 'FAILED' || phonePeStatus.status === 'EXPIRED';

    if (isSuccess || isFailed) {
      const newStatus = isSuccess ? 'success' : 'failed';
      await adminClient
        .from('payments')
        .update({
          status:                newStatus,
          phonepe_transaction_id: phonePeStatus.phonepeTransactionId,
          completed_at:           new Date().toISOString(),
        })
        .eq('merchant_transaction_id', txnId);

      await adminClient
        .from('orders')
        .update({ payment_status: isSuccess ? 'paid' : 'failed' })
        .eq('id', payment.order_id);

      return NextResponse.json({
        status:                newStatus,
        merchantTransactionId: txnId,
        phonepeTransactionId:  phonePeStatus.phonepeTransactionId,
        amount:                payment.amount,
        orderId:               payment.order_id,
      });
    }

    return NextResponse.json({
      status:                'pending',
      merchantTransactionId: txnId,
      amount:                payment.amount,
      orderId:               payment.order_id,
    });
  } catch (err) {
    console.error('Payment status check error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}