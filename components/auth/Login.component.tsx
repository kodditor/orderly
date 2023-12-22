"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { clientSupabase } from "@/app/supabase/supabase-client"

/*
* TODO
* Add pattern validation
* Add indicator
*/

export default function LoginComponent(){

    const router = useRouter()
    const searchParams = useSearchParams()

    const [ email, setEmail         ] = useState<string>('')
    const [ pass, setPass           ] = useState<string>('')
    const [ submitted, setSubmitted ] = useState<boolean>(false)

    const supabase = clientSupabase

    let destination = searchParams.get('to')

    async function handleLoginSubmit(e: FormEvent){
        
        setSubmitted(true)
        e.preventDefault()
       
        let { data, error } = await supabase.auth.signInWithPassword(
            {
                email: email,
                password: pass,
            }
        )

        if (data.user){
            
            router.push( ( '/' + destination ) || '/s/dashboard')

        } else {
            /*
            * Show wrong password
            * Ask to retry
            * set submitted to false
            */
            console.log(error)
        }
    }

    return (
        <>
            <div className="m-auto w-[80%]  md:mt-10 lg:mt-16 max-w-48 flex justify-center">
                <form onSubmit={handleLoginSubmit} className="flex flex-col items-center gap-4 w-72 " >
                    <h6>Welcome Back.</h6>
                    <h1 className="text-3xl font-bold mb-4">Login</h1>
                    <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Email Address" type="email" id='email' onChange={(e)=>{setEmail(e.target.value)}} required/>
                    <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Password" type="password" id='pwd' onChange={(e)=>{setPass(e.target.value)}} minLength={8} required/>
                    <button className="rounded-full w-full mb-4" disabled={submitted}>
                            <div style={{display: submitted ? 'block' : 'none'}} id="loading"></div>
                            <span style={{display: submitted ? 'none' : 'block'}} >Access Dashboard</span>
                        </button>
                    <h3>Don't have an account? <a href={`/auth/signup?to=${destination || '/s/dashboard' }`} className=" text-red cursor-pointer underline-offset-1 hover:underline-offset-2 duration-150 underline">Sign Up</a></h3>
                    <a href={`/auth/forgot?to=${destination}`} className="cursor-pointer no-underline hover:underline duration-150"><h4>Forgot Password?</h4></a>
                </form>
            </div>
        </>
    )
}