import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
 
export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    //console.log(code)

    if(code){
        const supabase = createRouteHandlerClient({cookies,
        },
        {
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!, 
            supabaseKey: process.env.NEXT_PUBLIC_ANON_KEY!
        })
        await supabase.auth.exchangeCodeForSession(code)
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/s/onboarding`)
    
}