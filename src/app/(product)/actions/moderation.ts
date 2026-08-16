'use server';

import { createClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";

export async function blockUser(blockedId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  if (user.id === blockedId) throw new Error("Cannot block yourself");

  const { error } = await supabase
    .from('user_blocks')
    .insert({
      blocker_id: user.id,
      blocked_id: blockedId
    });

  if (error) throw new Error(error.message);

  // Revalidate to apply filters
  revalidatePath('/discover');
  revalidatePath('/messages');
  revalidatePath(`/profile/${blockedId}`);
}

export async function unblockUser(blockedId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from('user_blocks')
    .delete()
    .match({
      blocker_id: user.id,
      blocked_id: blockedId
    });

  if (error) throw new Error(error.message);

  revalidatePath('/discover');
  revalidatePath('/messages');
  revalidatePath(`/profile/${blockedId}`);
}

export async function reportContent(targetType: 'user' | 'moment' | 'message', targetId: string, reason: string, details?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from('content_reports')
    .insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason,
      details
    });

  if (error) throw new Error(error.message);
}

export async function getBlockedUserIds(): Promise<string[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get users blocked BY current user
  const { data: blocksByMe } = await supabase
    .from('user_blocks')
    .select('blocked_id')
    .eq('blocker_id', user.id);

  // Optional: Also get users who blocked the current user, so they can't see each other.
  // Wait, RLS on user_blocks only allows the blocker to see their blocks.
  // To mutually hide, we'd need a trusted server function or allow reading 'blocked_id = auth.uid()'.
  // For now, blocking acts one-way (blocker doesn't see blocked). 

  return blocksByMe ? blocksByMe.map(b => b.blocked_id) : [];
}
