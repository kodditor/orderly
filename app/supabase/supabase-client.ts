"use client"

import { Database } from '@/types/supabase'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const clientSupabase = createClientComponentClient<Database>({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    supabaseKey: process.env.NEXT_PUBLIC_ANON_KEY!
})