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
