import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// We use the admin service role to bypass RLS for this background job
// Since we don't strictly have service_role key in this boilerplate's .env, 
// we will fallback to anon key but relying on a secure API route is better.
// Actually, without service_role, we cannot update rows unless we are the owner.
// So we must use a Postgres RPC (function) with SECURITY DEFINER.

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // To execute this, we use standard client to call an RPC function
  // because we might not have a service_role key handy.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error } = await supabase.rpc('archive_expired_moments');

  if (error) {
    console.error('Failed to run cron job:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
