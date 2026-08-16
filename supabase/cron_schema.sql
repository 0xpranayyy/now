-- Function to archive expired moments
-- SECURITY DEFINER allows it to bypass RLS and run as the creator of the function (postgres)
CREATE OR REPLACE FUNCTION public.archive_expired_moments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update all active moments that have passed their expiration time
  UPDATE public.moments
  SET status = 'expired'
  WHERE status = 'active' AND expires_at <= timezone('utc'::text, now());
END;
$$;
