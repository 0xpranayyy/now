'use server'

import { createClient } from "@/lib/db/supabase/server"
import { revalidatePath } from "next/cache"

export async function createPost(momentId: string, content: string, mediaUrl?: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('You must be logged in to post.')
  }

  const { error } = await supabase
    .from('posts')
    .insert({
      moment_id: momentId,
      author_id: user.id,
      body: content,
      media_url: mediaUrl || null,
    })

  if (error) {
    throw new Error(error.message)
  }

  // Realtime will handle the UI update, but we revalidate just in case for SSR
  revalidatePath(`/moment/${momentId}`)
}
