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
