"use client"

import { clientSupabase } from "@/app/supabase/supabase-client"
import { useSearchParams, useRouter } from "next/navigation"
import { FormEvent, useRef, useState } from "react"
import { popupText } from "../Popup.component"
import HCaptcha from "@hcaptcha/react-hcaptcha"

export default function ForgotPasswordComponent(){

    const searchParams = useSearchParams()

    const [ email, setEmail ] = useState<string>('')

    const [ submitted, setSubmitted ] = useState<boolean>(false)
    const [ verified, setVerified   ] = useState<boolean>(false)
    const [ emailSent, setEmailSent ] = useState<boolean>(false) 

    const captchaRef = useRef<HCaptcha>(null);

    const supabase = clientSupabase

    let destination = searchParams.get('to')

    async function handleEmailSubmit(e: FormEvent){
        if(!verified) return
        e.preventDefault()
        setSubmitted(true)
        let redirectURL: string = location.origin + `/auth/update-password?to=s/dashboard`

        if(destination && destination.length != 0){
            if(destination.startsWith('/')){
                redirectURL = location.origin + `/auth/update-password?to=${destination}`
            } else {
                redirectURL = location.origin + `/auth/update-password?to=${( '/' + destination )}`
            }
        } 

        let { error } = await supabase.auth.resetPasswordForEmail(
            email, 
            {
                redirectTo: redirectURL
            }
        )

        if (error){
            setSubmitted(false)
            popupText(`SB${error.status}: An error occurred. Please try again later.`)
            console.log(error)
        } else {
            setEmailSent(true)
            captchaRef.current!.resetCaptcha()
        }

    }

    
    if(!emailSent)
    {
        return(
            <>
                <div className="m-auto w-[80%] mt-6 md:mt-10 lg:mt-16 flex justify-center" >
                    <form onSubmit={handleEmailSubmit} className="flex flex-col items-center gap-4 w-72 " >
                        <h6>Forgot your password?</h6>
                        <h1 className="text-3xl text-center font-bold mb-[-10px]">Enter your email</h1>
                        <p className="text-center mb-4">We'll send you an email with steps on how to reset your password</p>
                        <span className="w-full flex flex-col gap-2">
                            <label className="text-sm" htmlFor="email">Email Address</label>
                            <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="kwaku@ananse.com" type="email" name="email" id='email' onChange={(e)=>{setEmail(e.target.value)}} required/>
                        </span>
                        <button className="rounded-full w-full mb-4" disabled={submitted || !verified}>
                            <div style={{display: submitted ? 'block' : 'none'}} id="loading"></div>
                            <span style={{display: submitted ? 'none' : 'block'}} >Reset Password</span>
                        </button>
                        <HCaptcha
                            ref={captchaRef}
                            sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                            onVerify={() => setVerified(true)}
                        />
                    <h3>Already have an account? <a href={`/auth/login?to=${destination || '/s/dashboard' }`}  className=" text-red cursor-pointer underline underline-offset-1 hover:underline-offset-2 duration-150">Login</a></h3>
                    
                    </form>
                </div>
            </>
        )
    } else {
        return (
            <>
                <div className="m-auto w-[80%] md:mt-10 lg:mt-16  flex justify-center" >
                    <div  className="flex flex-col items-center gap-4 w-72 " >
                        <h6>Almost done.</h6>
                        <h1 className="text-3xl text-center font-bold">Check your mail</h1>
                        <p className="text-center mb-4">We've sent you an email!<br />Click on the link in the email to reset your password.</p>
                    </div>
                </div>
            </>
        )
    }


}