"use client"

import { clientSupabase } from "@/app/supabase/supabase-client"
import { useSearchParams, useRouter } from "next/navigation"
import { FormEvent, useState } from "react"


/*
* TODO
* Add pattern validation
* Add indicator
* Add password scheme rules
* Phone number validation
*/

export default function SignUpComponent(){

    const router = useRouter()
    const searchParams = useSearchParams()

    const [email, setEmail ] = useState<string>('')
    const [pass, setPass] = useState<string>('')
    // const [phone, setPhone] = useState<string>('')
    const [ submitted, setSubmitted ] = useState<boolean>(false)  

    const supabase = clientSupabase

    let destination = searchParams.get('to')

    async function handleSignUpSubmit(e: FormEvent){
        e.preventDefault()
        setSubmitted(true)

        let {data, error } = await supabase.auth.signUp(
            {
                email: email,
                password: pass,
                options: {
                    emailRedirectTo: `${location.origin}/api/auth/signup/callback`
                }
            }
        )

        if (data.user){
            
            router.push( ( '/' + destination ) || '/s/dashboard')

        } else {
            /*
            * Show wrong password
            * Ask to retry
            * set submitted tp false
            */
            console.log(error)
        
        }
    }

    return(
        <>
            <div className="m-auto w-[80%] max-w-48 md:mt-10 lg:mt-16 flex justify-center">
                    <form onSubmit={handleSignUpSubmit} className="flex flex-col items-center gap-4 w-72 ">
                        <h6>Welcome.</h6>
                        <h1 className="text-3xl font-bold mb-4">Sign Up</h1>
                        <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Email Address" type="email" id='email' onChange={(e)=>{setEmail(e.target.value)}} required/>
                        <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Password" type="password" id='pwd' onChange={(e)=>{setPass(e.target.value)}}  minLength={8} required/>
                        {/* <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Phone Number" type="phone" id='phone' onChange={(e)=>{setPhone(e.target.value)}}  pattern="*.[0-9]" minLength={8} required/> */}
                        <button className="rounded-full w-full mb-4" disabled={submitted}>
                            <div style={{display: submitted ? 'block' : 'none'}} id="loading"></div>
                            <span style={{display: submitted ? 'none' : 'block'}} >Get Orderly</span>
                        </button>
                    <h3>Already have an account? <a href={`/auth/login?to=${destination || '/s/dashboard' }`}  className=" text-red cursor-pointer underline underline-offset-1 hover:underline-offset-2 duration-150"><span>Login</span></a></h3>
                    <a href={`/auth/forgot?to=${destination}`} className="cursor-pointer no-underline hover:underline duration-150"><h4>Forgot Password?</h4></a>
                    </form>
                </div>
        </>
    )

}