import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { OrderRealtimeView } from '@/components/orders/OrderRealtimeView';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string; payment?: string }>;
}

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { new: isNew, payment: paymentResult } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .eq('student_id', user.id)
    .single();

  if (!order) notFound();

  let queueAhead = 0;
  if (['pending', 'accepted', 'printing'].includes(order.status)) {
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'accepted', 'printing'])
      .lt('created_at', order.created_at);
    queueAhead = count ?? 0;
  }

  return (
    <div className="px-4 py-6 sm:p-10 max-w-4xl mx-auto animate-fade-in">
      <OrderRealtimeView
        order={order}
        isNew={isNew === '1' || isNew === 'true'}
        paymentResult={paymentResult}
        initialQueueAhead={queueAhead}
      />
    </div>
  );
}

