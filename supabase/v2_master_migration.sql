-- 1. Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 2. Conversation Participants Table (Join Table)
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (conversation_id, user_id)
);

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- 3. Direct Messages Table
CREATE TABLE IF NOT EXISTS public.direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Index for faster realtime querying
CREATE INDEX idx_direct_messages_conversation ON public.direct_messages(conversation_id);

-- RLS Policies

-- Conversations: A user can see a conversation if they are a participant
CREATE POLICY "Users can view their conversations" ON public.conversations 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.conversation_participants 
        WHERE conversation_id = id AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert conversations" ON public.conversations 
FOR INSERT WITH CHECK (true); -- Requires inserting participants immediately after

-- Participants: Users can view participants of their conversations
CREATE POLICY "Users can view participants of their conversations" ON public.conversation_participants 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.conversation_participants AS cp 
        WHERE cp.conversation_id = conversation_participants.conversation_id AND cp.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert participants" ON public.conversation_participants 
FOR INSERT WITH CHECK (
    user_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.conversation_participants AS cp 
        WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
    )
);

-- Messages: Users can read and send messages in their conversations
CREATE POLICY "Users can view messages in their conversations" ON public.direct_messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.conversation_participants 
        WHERE conversation_id = direct_messages.conversation_id AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can send messages to their conversations" ON public.direct_messages
FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.conversation_participants 
        WHERE conversation_id = direct_messages.conversation_id AND user_id = auth.uid()
    )
);
-- Create follows table
CREATE TABLE IF NOT EXISTS public.follows (
    follower_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (follower_id, following_id)
);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anyone can read follows
CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);

-- Users can only insert their own follows
CREATE POLICY "Users can follow others" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Users can only delete their own follows
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (auth.uid() = follower_id);
-- 1. User Blocks Table
CREATE TABLE IF NOT EXISTS public.user_blocks (
    blocker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (blocker_id, blocked_id)
);

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own blocks" ON public.user_blocks 
FOR SELECT USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block others" ON public.user_blocks 
FOR INSERT WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock others" ON public.user_blocks 
FOR DELETE USING (auth.uid() = blocker_id);


-- 2. Content Reports Table
CREATE TABLE IF NOT EXISTS public.content_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL, -- e.g., 'user', 'moment', 'post', 'message'
    target_id UUID NOT NULL, -- The ID of the reported entity
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'reviewed', 'resolved', 'dismissed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports" ON public.content_reports 
FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports" ON public.content_reports 
FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- System admin policies would go here to allow viewing all reports
-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- The recipient
    actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Who triggered it
    type TEXT NOT NULL, -- e.g., 'follow', 'moment_invite', 'system'
    entity_id UUID, -- References the related object (e.g., a moment id)
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id) WHERE is_read = false;

-- Policies
CREATE POLICY "Users can view their own notifications" ON public.notifications 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System and users can insert notifications" ON public.notifications 
FOR INSERT WITH CHECK (true); -- Allow Server Actions to insert for other users

CREATE POLICY "Users can mark their own notifications as read" ON public.notifications 
FOR UPDATE USING (auth.uid() = user_id);
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read push subscriptions" 
ON public.push_subscriptions 
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own push subscriptions" 
ON public.push_subscriptions 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push subscriptions" 
ON public.push_subscriptions 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push subscriptions" 
ON public.push_subscriptions 
FOR DELETE USING (auth.uid() = user_id);
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
-- Add is_verified to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false NOT NULL;
