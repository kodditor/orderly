"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { FormEvent, useRef, useState } from "react"

import { clientSupabase } from "@/app/supabase/supabase-client"
import HCaptcha from "@hcaptcha/react-hcaptcha"


export default function UpdatePasswordComponent(){

    const router = useRouter()
    const searchParams = useSearchParams()

    const [ pass, setPass ] = useState<string>('')
    const [ submitted, setSubmitted ] = useState<boolean>(false)
    const [ verified, setVerified   ] = useState<boolean>(false)
    const [ passChanged, setPassChanged ] = useState<boolean>(false)

    const [ count, setCount ] = useState<number>(5)

    const captchaRef = useRef<HCaptcha>(null);

    const supabase = clientSupabase

    let destination = searchParams.get('to')

    async function handlePasswordSubmit(e: FormEvent){
        if(!verified) return
        e.preventDefault()
        setSubmitted(true)

        const { data, error } = await supabase.auth.updateUser({
            password: pass,
        })

        if (error){
            setSubmitted(false)
            console.log(error)
        }
        else{
            setPassChanged(true)
            captchaRef.current!.resetCaptcha()
            countdown()
        }
    }

    function countdown() {
        setTimeout(()  =>{
            setCount(4)
            setTimeout(()  =>{
                setCount(3)
                setTimeout(()  =>{
                    setCount(2)
                    setTimeout(()  =>{
                        setCount(1)
                        setTimeout(()  =>{
                            router.push('/' + (destination ?? 's/dashboard') )
                            // It smells but it works
                        }, 1000)
                    }, 1000)
                }, 1000)
            }, 1000)
        }, 1000)
    }

    if(!passChanged)
    {

        return(
            <>
                <div className="m-auto w-[80%] mt-6 md:mt-10 lg:mt-16 flex justify-center">
                    <form onSubmit={handlePasswordSubmit} className="flex flex-col items-center gap-4 w-72 ">
                        <h6 className=" text-center">Passwords, passwords, passwords.<br /> For security's sake!</h6>
                        <h1 className="text-3xl font-bold mb-[-10px] text-center">Reset Your Password</h1>
                        <p className="text-center mb-4">Enter your new password</p>
                        <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="New Password" type="password" id='pass' onChange={(e)=>{setPass(e.target.value)}} required/>
                        <button className="rounded-full w-full mb-4" disabled={submitted || !verified}>
                            <div style={{display: submitted ? 'block' : 'none'}} id="loading"></div>
                            <span style={{display: submitted ? 'none' : 'block'}} >Reset Password</span>
                        </button>
                        <HCaptcha
                            ref={captchaRef}
                            sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                            onVerify={() => setVerified(true)}
                        />
                        <h3>Don't have an account? <a href={`/auth/signup?to=${destination || '/s/dashboard' }`}  className=" text-red cursor-pointer underline underline-offset-1 hover:underline-offset-2 duration-150">Sign Up</a></h3>
                    
                    </form>
                </div>
            </>
        )
    } else {
        return(
            <>
                <div className="m-auto w-[80%]  md:mt-10 lg:mt-16 flex justify-center">
                    <div className="flex flex-col items-center gap-4 w-72 ">
                        <h6 className=" text-center">Password updated!</h6>
                        <h1 className="text-3xl font-bold text-center">Redirecting you to your dashboard in {count}</h1>
                        <p className="text-center mb-4">You've updated your password!<br />We'll send you back in a jiffy!</p>
                    </div>
                </div>
            </>
        )           
    }

}