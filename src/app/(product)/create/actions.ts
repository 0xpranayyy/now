'use server'

import { createClient } from "@/lib/db/supabase/server"
import { redirect } from "next/navigation"

export async function createMomentAction(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const latStr = formData.get('lat') as string
  const lngStr = formData.get('lng') as string

  // Set expiration to 4 hours from now
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 4)

  const { data, error } = await supabase
    .from('moments')
    .insert({
      creator_id: user.id,
      title,
      description: description || null,
      category,
      latitude: latStr ? parseFloat(latStr) : null,
      longitude: lngStr ? parseFloat(lngStr) : null,
      visibility: 'public',
      status: 'LIVE',
      expires_at: expiresAt.toISOString()
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  // Redirect to the newly created moment
  redirect(`/moment/${data.id}`)
}
