"use client"

import { clientSupabase } from "@/app/supabase/supabase-client"
import { faEyeSlash, faEye } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
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
    const [ showPassword, setShowPassword ] = useState<boolean>(false)
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
                        <span className="w-full relative">
                            <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="superSecretPassword" type={showPassword ? 'text' : 'password'} id='password' name="password" onChange={(e)=>{setPass(e.target.value)}} minLength={8} required/>
                            <div className="absolute right-[5px] top-[5px] h-[calc(100%-10px)] aspect-square p-1 rounded-full bg-white hover:bg-gray-50 duration-150 cursor-pointer text-darkRed flex items-center justify-center" onClick={()=>{setShowPassword((prev) => !prev)}}>
                                <FontAwesomeIcon width={15} height={15} icon={showPassword ? faEyeSlash : faEye} />
                            </div>
                        </span>
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