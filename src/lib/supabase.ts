// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabase) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (!url || !key) {
        // During build/SSR with no env vars, return a no-op
        return () => ({ data: null, error: { message: 'Supabase not initialized' } })
      }
      _supabase = createClient(url, key)
    }
    return (_supabase as any)[prop]
  }
})