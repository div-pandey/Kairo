import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PRICING } from '@/lib/constants';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('pricing_config')
      .select('bw_price_per_page, colour_price_per_page')
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json({
        bw_price_per_page: PRICING.bw,
        colour_price_per_page: PRICING.colour,
      });
    }

    return NextResponse.json({
      bw_price_per_page: Number(data.bw_price_per_page),
      colour_price_per_page: Number(data.colour_price_per_page),
    });
  } catch {
    return NextResponse.json({
      bw_price_per_page: PRICING.bw,
      colour_price_per_page: PRICING.colour,
    });
  }
}
