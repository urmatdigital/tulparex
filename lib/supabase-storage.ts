import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const getImageUrl = (imagePath: string) => {
  const { data } = supabase.storage.from('public').getPublicUrl(imagePath)
  return data.publicUrl
}

// Upload images to Supabase Storage
export const uploadImage = async (file: File, path: string) => {
  const { data, error } = await supabase.storage
    .from('public')
    .upload(path, file)

  if (error) {
    throw error
  }

  return getImageUrl(path)
}
