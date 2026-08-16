import { createClient } from "@/lib/db/supabase/server";
import { notFound, redirect } from "next/navigation";
import { LiveDMView } from "./LiveDMView";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify access and get conversation details
  const { data: participant } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('conversation_id', id)
    .eq('user_id', user.id)
    .single();

  if (!participant) {
    notFound();
  }

  // Get the other user
  const { data: otherParticipant } = await supabase
    .from('conversation_participants')
    .select('users ( id, username, display_name, avatar_url )')
    .eq('conversation_id', id)
    .neq('user_id', user.id)
    .single();

  const otherUser = otherParticipant?.users;
  if (!otherUser) {
    notFound();
  }

  // Fetch initial messages
  const { data: initialMessages } = await supabase
    .from('direct_messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <LiveDMView 
      conversationId={id}
      currentUserId={user.id}
      otherUser={otherUser as any}
      initialMessages={initialMessages?.reverse() || []}
    />
  );
}
