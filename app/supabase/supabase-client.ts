"use client"

import { Database } from '@/types/supabase'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from "next/headers"

export const clientSupabase = createClientComponentClient<Database>({
    supabaseUrl: process.env.SUPABASE_URL!, 
    supabaseKey: process.env.NEXT_PUBLIC_ANON_KEY!
})