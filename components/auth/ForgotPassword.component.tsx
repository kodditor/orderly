"use client"

import { clientSupabase } from "@/app/supabase/supabase-client"
import { useSearchParams, useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

export default function ForgotPasswordComponent(){

    const router = useRouter()
    const searchParams = useSearchParams()

    const [email, setEmail ] = useState<string>('')
    const [pass, setPass] = useState<string>('')

    const [ submitted, setSubmitted ] = useState<boolean>(false) 
    const [ emailSent, setEmailSent ] = useState<boolean>(false) 

    const supabase = clientSupabase

    let destination = searchParams.get('to')

    async function handleEmailSubmit(e: FormEvent){
        e.preventDefault()
        setSubmitted(true)
        
        let redirectURL = location.origin + `/auth/update-password?to=${destination}`

        let { data, error } = await supabase.auth.resetPasswordForEmail(
            email, 
            {
                redirectTo: redirectURL
            }
        )

        if (error){
            setSubmitted(false)
            console.log(error)
        } else {
            setEmailSent(true)
        }
    }

    
    if(!emailSent)
    {
        return(
            <>
                <div className="m-auto w-[95%] md:w-[80%] max-w-48 pt-8 md:pt-10 lg:pt-16 flex justify-center">
                        <form onSubmit={handleEmailSubmit} className="flex flex-col items-center gap-4 w-72 " >
                            <h6>Forgot your password?</h6>
                            <h1 className="text-3xl font-bold mb-[-10px]">Enter your email</h1>
                            <p className="text-center mb-4">We'll send you an email with steps on how to reset your password</p>
                            <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Email Address" type="email" id='email' onChange={(e)=>{setEmail(e.target.value)}} required/>
                            <button className="rounded-full w-full mb-4" disabled={submitted}>
                                <div style={{display: submitted ? 'block' : 'none'}} id="loading"></div>
                                <span style={{display: submitted ? 'none' : 'block'}} >Reset Password</span>
                            </button>
                        <h3>Already have an account? <a href={`/auth/login?to=${destination || '/s/dashboard' }`}  className=" text-red cursor-pointer underline underline-offset-1 hover:underline-offset-2 duration-150">Login</a></h3>
                        
                        </form>
                    </div>
            </>
        )
    } else {
        return (
            <>
                <div className="m-auto w-[95%] w-[80%] max-w-48 pt-8 md:pt-10 lg:pt-16 flex justify-center">
                    <div  className="flex flex-col items-center gap-4 w-72 " >
                        <h6>Almost done.</h6>
                        <h1 className="text-3xl font-bold mb-[-10px]">Check your mail</h1>
                        <p className="text-center mb-4">We've sent you an email!<br />Click on the link in the email to reset your password.</p>
                        <a href="https://mail.google.com" target="_blank"><button>Open My Mail</button></a>
                    </div>
                </div>
            </>
        )
    }


}