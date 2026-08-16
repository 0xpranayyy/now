'use server'

import { createClient } from "@/lib/db/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const displayName = formData.get('display_name') as string
  const bio = formData.get('bio') as string
  const homeCity = formData.get('home_city') as string

  const { error } = await supabase
    .from('users')
    .update({
      display_name: displayName,
      bio: bio || null,
      home_city: homeCity || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/profile')
  revalidatePath('/discover') // in case their name updates on active moments
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const file = formData.get('avatar') as File
  if (!file) {
    throw new Error('No file provided')
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Math.random()}.${fileExt}`
  
  // 1. Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  // 2. Get Public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  // 3. Update User Profile
  const { error: updateError } = await supabase
    .from('users')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  if (updateError) {
    throw new Error(updateError.message)
  }

  revalidatePath('/profile')
  revalidatePath('/discover')
}

export async function forceCreateProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const username = formData.get('username') as string
  const displayName = formData.get('display_name') as string

  // Insert missing profile
  const { error } = await supabase
    .from('users')
    .insert({
      id: user.id,
      username: username,
      display_name: displayName,
    })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/profile')
}
