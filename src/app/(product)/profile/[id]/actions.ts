'use server';

import { createClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";
import { sendPushNotification } from "@/lib/push";

export async function followUser(targetUserId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");

  if (user.id === targetUserId) throw new Error("Cannot follow yourself");

  const { error } = await supabase
    .from('follows')
    .insert({
      follower_id: user.id,
      following_id: targetUserId
    });

  if (error) throw new Error(error.message);

  // Trigger Notification
  await supabase
    .from('notifications')
    .insert({
      user_id: targetUserId,
      actor_id: user.id,
      type: 'follow'
    });

  // Try to send push notification
  try {
    const followerName = user.user_metadata?.display_name || 'Someone';
    await sendPushNotification(
      targetUserId,
      "New Follower!",
      `${followerName} started following you.`,
      `/profile/${user.id}`
    );
  } catch (e) {
    console.error("Push notification failed:", e);
  }

  revalidatePath(`/profile/${targetUserId}`);
  revalidatePath('/profile');
}

export async function unfollowUser(targetUserId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");

  const { error } = await supabase
    .from('follows')
    .delete()
    .match({
      follower_id: user.id,
      following_id: targetUserId
    });

  if (error) throw new Error(error.message);

  revalidatePath(`/profile/${targetUserId}`);
  revalidatePath('/profile');
}
