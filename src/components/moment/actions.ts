'use server'

import { createClient } from '@/lib/db/supabase/server'

export async function toggleLikeMoment(momentId: string, isLiking: boolean) {
  const supabase = await createClient();
  
  // Note: For a robust system, we would have a moment_likes join table to track exactly WHO liked what.
  // For V2, we are just implementing a global counter for simplicity, incrementing/decrementing directly via RPC or standard update.
  
  // Since standard update without RPC is tricky for increments, and we didn't write an RPC, we will fetch and update.
  // (In production, definitely use a join table or RPC for race-condition-safe increments).
  
  const { data: moment } = await supabase
    .from('moments')
    .select('likes_count')
    .eq('id', momentId)
    .single();

  if (!moment) throw new Error("Moment not found");

  let newCount = (moment.likes_count || 0);
  if (isLiking) {
    newCount += 1;
  } else {
    newCount = Math.max(0, newCount - 1);
  }

  const { error } = await supabase
    .from('moments')
    .update({ likes_count: newCount })
    .eq('id', momentId);

  if (error) {
    console.error("Failed to update likes:", error);
    throw new Error("Failed to like moment");
  }
}
