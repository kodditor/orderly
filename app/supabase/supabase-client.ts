"use client"

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from "next/headers"

export const clientSupabase = createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    supabaseKey: process.env.NEXT_PUBLIC_ANON_KEY!
})