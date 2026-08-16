'use server';

import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sendPushNotification } from "@/lib/push";

export async function getOrCreateConversation(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Check if conversation already exists between these two users
  // This requires a complex query or a plpgsql function ideally.
  // For now, we fetch conversations for current user, then check participants.
  
  const { data: myConversations } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', user.id);

  if (myConversations && myConversations.length > 0) {
    const convoIds = myConversations.map(c => c.conversation_id);
    
    // Find if the target user is in any of these conversations
    const { data: sharedConvo } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', targetUserId)
      .in('conversation_id', convoIds)
      .limit(1)
      .maybeSingle();

    if (sharedConvo) {
      redirect(`/messages/${sharedConvo.conversation_id}`);
    }
  }

  // If no conversation exists, create one
  const { data: newConvo, error: createError } = await supabase
    .from('conversations')
    .insert({})
    .select('id')
    .single();

  if (createError) throw new Error(createError.message);

  // Add both participants
  const { error: partError } = await supabase
    .from('conversation_participants')
    .insert([
      { conversation_id: newConvo.id, user_id: user.id },
      { conversation_id: newConvo.id, user_id: targetUserId }
    ]);

  if (partError) throw new Error(partError.message);

  redirect(`/messages/${newConvo.id}`);
}

export async function sendDirectMessage(conversationId: string, body: string, mediaUrl?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from('direct_messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body,
      media_url: mediaUrl || null
    });

  if (error) throw new Error(error.message);

  // Send Push Notification to the other user
  try {
    // We need to find the other user in the conversation
    const { data: participants } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .neq('user_id', user.id);
      
    if (participants && participants.length > 0) {
      const otherUserId = participants[0].user_id;
      const senderName = user.user_metadata?.display_name || 'Someone';
      await sendPushNotification(
        otherUserId,
        `New message from ${senderName}`,
        mediaUrl ? "Sent an image" : body,
        `/messages/${conversationId}`
      );
    }
  } catch (e) {
    console.error("Push notification failed:", e);
  }

  // Update conversation updated_at for sorting inbox
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  revalidatePath('/messages');
  revalidatePath(`/messages/${conversationId}`);
}
