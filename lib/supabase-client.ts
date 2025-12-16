'use client'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabaseClient: SupabaseClient | null = null

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  if (supabaseClient) {
    return supabaseClient
  }

  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
    return supabaseClient
  } catch (error) {
    console.warn('Failed to create Supabase client:', error)
    return null
  }
}

