"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { FormEvent, useRef, useState } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { clientSupabase } from "@/app/supabase/supabase-client"
import { popupText } from "../Popup.component"
import HCaptcha from "@hcaptcha/react-hcaptcha"


/*
* TODO
* Add pattern validation
* Add indicator
*/

type loginDetails = {
    email: string,
    password: string
}

export default function LoginComponent(){

    const router = useRouter()
    const searchParams = useSearchParams()

    const [ submitted, setSubmitted ] = useState<boolean>(false)
    const [ verified, setVerified   ] = useState<boolean>(false)
    const [ failedLoginCounter, setFailedLogins ] = useState<number>(0)

    const captchaRef = useRef<HCaptcha>(null);

    const [ loginDetails, setLoginDetails] = useState<loginDetails>({
        email: "",
        password: ""
    })

    const supabase = clientSupabase

    let destination = searchParams.get('to')

    async function handleLoginSubmit(e: FormEvent){
        e.preventDefault()
        if(!verified) return
        setSubmitted(true)
       
        let { data, error } = await supabase.auth.signInWithPassword(
            loginDetails
        )

        if (data.user){
            
            if(destination && destination.length != 0){
                if(destination.startsWith('/')){
                    router.push(destination)
                } else {
                    router.push(( '/' + destination ))
                }
            } else {
                router.push('/s/dashboard')
            }
            captchaRef.current!.resetCaptcha()
        } else {
            popupText('Invalid login details entered.')
            if(( failedLoginCounter + 1 ) === 5){
                captchaRef.current!.resetCaptcha()
                setSubmitted(false)
                setFailedLogins(0)
                return
            }
            setFailedLogins((prev) => prev + 1)
            //console.log(error)
            setSubmitted(false)
        }
    }

    function handleValueChange(e: any){
        let field = e.target.name
        let value = e.target.value

        switch (field) {
            case "email":
            case "password":
                    setLoginDetails((prev) =>{
                        return ({
                            ...prev,
                            [field]: value
                        })
                    })
                break;
        
            default:
                popupText(`An error occurred. ${field} is not a valid field`)
                break;
        }


    }

    return (
        <>
            <div className="m-auto w-[80%]  md:mt-10 lg:mt-16 max-w-48 flex justify-center" >
                <form onSubmit={handleLoginSubmit} className="flex flex-col items-center gap-4 w-72 " >
                    <h6>Welcome Back.</h6>
                    <h1 className="text-3xl font-bold mb-4">Login</h1>
                    <span className="w-full flex flex-col gap-2">
                        <label className="text-sm" htmlFor="email">Email Address</label>
                        <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="kwaku@ananse.com" type="email" name="email" id='email' onChange={handleValueChange} required/>
                    </span>
                    <span className="w-full flex flex-col gap-2 mb-2">
                        <label className="text-sm" htmlFor="password">Password</label>
                        <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="superSecretPassword" type="password" id='password' name="password" onChange={handleValueChange} minLength={8} required/>
                    </span>
                    <button className="rounded-full w-full mb-4" disabled={submitted || !verified}>
                        <div style={{display: submitted ? 'block' : 'none'}} id="loading"></div>
                        <span style={{display: submitted ? 'none' : 'block'}} >Access Dashboard</span>
                    </button>
                    <HCaptcha
                        ref={captchaRef}
                        sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                        onVerify={() => setVerified(true)}
                    />
                    <h3>Don't have an account? <a href={`/auth/signup?to=${destination || '/s/dashboard' }`} className=" text-red cursor-pointer underline-offset-1 hover:underline-offset-2 duration-150 underline">Sign Up</a></h3>
                    <a href={`/auth/forgot?to=${destination}`} className="cursor-pointer no-underline hover:underline duration-150"><h4>Forgot Password?</h4></a>
                </form>
            </div>
        </>
    )
}