import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageCircle, User } from "lucide-react";
import { getBlockedUserIds } from "@/app/(product)/actions/moderation";

export default async function InboxPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch conversations for the current user
  const { data: participants } = await supabase
    .from('conversation_participants')
    .select(`
      conversation_id,
      conversations ( updated_at )
    `)
    .eq('user_id', user.id)
    .order('conversations(updated_at)', { ascending: false });

  let conversations: any[] = [];

  if (participants && participants.length > 0) {
    const convoIds = participants.map(p => p.conversation_id);

    // Fetch the OTHER participants in these conversations
    const { data: otherParticipants } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        users ( id, username, display_name, avatar_url )
      `)
      .in('conversation_id', convoIds)
      .neq('user_id', user.id);

    // Fetch the last message for each
    const { data: lastMessages } = await supabase
      .from('direct_messages')
      .select('conversation_id, body, created_at, sender_id')
      .in('conversation_id', convoIds)
      .order('created_at', { ascending: false });

    // Assemble the list
    conversations = (participants as any[]).map(p => {
      const otherUser = otherParticipants?.find(op => op.conversation_id === p.conversation_id)?.users;
      const latestMsg = lastMessages?.find(lm => lm.conversation_id === p.conversation_id);

      return {
        id: p.conversation_id,
        updated_at: p.conversations?.updated_at,
        otherUser,
        latestMessage: latestMsg
      };
    });
    
    // Filter out blocked users
    const blockedIds = await getBlockedUserIds();
    if (blockedIds.length > 0) {
      conversations = conversations.filter(convo => !blockedIds.includes(convo.otherUser?.id));
    }

    // Sort by updated_at descending
    conversations.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      <header className="px-6 py-4 mt-2">
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-50">
            <MessageCircle size={48} className="mb-4 text-muted-foreground" />
            <p>No messages yet.</p>
            <p className="text-sm mt-1">Start a conversation from a user's profile.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {conversations.map((convo) => (
              <Link 
                key={convo.id} 
                href={`/messages/${convo.id}`}
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden shrink-0">
                  {convo.otherUser?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={convo.otherUser.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <User size={20} />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold truncate">{convo.otherUser?.display_name || 'Unknown User'}</h3>
                    {convo.latestMessage && (
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {new Date(convo.latestMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {convo.latestMessage ? (
                      <>
                        {convo.latestMessage.sender_id === user.id ? 'You: ' : ''}
                        {convo.latestMessage.body}
                      </>
                    ) : (
                      <span className="italic">No messages yet</span>
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
