import { Database } from '@/types/supabase'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from "next/headers"

export const serverSupabase = createServerComponentClient<Database>({ cookies },
    {
    supabaseUrl: process.env.SUPABASE_URL!, 
    supabaseKey: process.env.NEXT_PUBLIC_ANON_KEY!
})


