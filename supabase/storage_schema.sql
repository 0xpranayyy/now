-- 1. Alter tables to support media
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE public.direct_messages ADD COLUMN IF NOT EXISTS media_url TEXT;

-- 2. Create Storage Bucket for Media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage RLS Policies
-- Allow anyone to view public media
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'media' );

-- Allow authenticated users to upload media
CREATE POLICY "Auth Upload" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'media' 
    AND auth.role() = 'authenticated'
);

-- Allow users to update their own media
CREATE POLICY "Auth Update" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'media' 
    AND auth.uid() = owner
);

-- Allow users to delete their own media
CREATE POLICY "Auth Delete" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'media' 
    AND auth.uid() = owner
);
