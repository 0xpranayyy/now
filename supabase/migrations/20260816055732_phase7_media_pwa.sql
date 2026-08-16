-- 1. Add media_url to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS media_url TEXT;

-- 2. Add media_url to direct_messages
ALTER TABLE public.direct_messages ADD COLUMN IF NOT EXISTS media_url TEXT;

-- 3. Create media storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'media',
    'media',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 4. Storage Bucket RLS Policies for media
-- Enable RLS (already enabled on objects table)

-- Read access to everyone
CREATE POLICY "Public Access Media"
ON storage.objects FOR SELECT
USING ( bucket_id = 'media' );

-- Insert access to authenticated users
CREATE POLICY "Authenticated Users Can Upload Media Bucket"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'media' AND auth.role() = 'authenticated'
);

-- Delete access for users who own the media
CREATE POLICY "Users Can Delete Their Own Media Bucket"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'media' AND auth.uid() = owner
);
