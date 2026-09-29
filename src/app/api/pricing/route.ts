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

export async function PUT(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    const { data: adminRecord } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!adminRecord) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const bwPrice = Number(body.bw_price_per_page);
    const colourPrice = Number(body.colour_price_per_page);

    if (isNaN(bwPrice) || bwPrice <= 0 || bwPrice > 100) {
      return NextResponse.json({ error: 'B&W price must be between ₹1 and ₹100' }, { status: 400 });
    }

    if (isNaN(colourPrice) || colourPrice <= 0 || colourPrice > 100) {
      return NextResponse.json({ error: 'Colour price must be between ₹1 and ₹100' }, { status: 400 });
    }

    // Fetch existing row ID to update or insert
    const { data: existing } = await supabase
      .from('pricing_config')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      const { error: updateError } = await supabase
        .from('pricing_config')
        .update({
          bw_price_per_page: bwPrice,
          colour_price_per_page: colourPrice,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update pricing' }, { status: 500 });
      }
    } else {
      const { error: insertError } = await supabase
        .from('pricing_config')
        .insert({
          bw_price_per_page: bwPrice,
          colour_price_per_page: colourPrice,
        });

      if (insertError) {
        return NextResponse.json({ error: 'Failed to insert pricing' }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      bw_price_per_page: bwPrice,
      colour_price_per_page: colourPrice,
    });
  } catch (err: any) {
    console.error('Pricing update error:', err);
    return NextResponse.json({ error: 'Failed to update pricing rates' }, { status: 500 });
  }
}
