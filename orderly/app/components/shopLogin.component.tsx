"use client"
import { useRouter } from "next/navigation"
import { supabase } from "../supabase"
import { FormEvent, useState } from "react"

export default function ShopLoginComponent(){

    const router = useRouter()

    const [isSigningUp, setIsSigningUp] = useState<boolean>(false)
    const [email, setEmail ] = useState<string>('')
    const [pass, setPass] = useState<string>('')
    const [phone, setPhone] = useState<string>('')

    async function handleLoginSubmit(e: FormEvent){
        e.preventDefault()
        let {data, error } = await supabase.auth.signInWithPassword(
            {
                email: email,
                password: pass,
            }
        )

        if (data){
            router.push('/s/dashboard')
        } else {
            console.log(error)
        }
    }

    async function handleSignUpSubmit(e: FormEvent){
        e.preventDefault()
        let {data, error } = await supabase.auth.signUp(
            {
                email: email,
                password: pass,
                phone: phone,
            }
        )

        if (!error){
            console.log(data.user)
            router.push('/s/dashboard')
        } else {
            console.log(error)
        }
    }

    if(isSigningUp)
    {
        return(
            <>
                <div className="m-auto w-[80%] max-w-48 flex justify-center">
                        <form onSubmit={handleSignUpSubmit} className="flex flex-col items-center gap-4 w-72 ">
                            <h1 className="text-3xl font-bold mb-4">Sign Up</h1>
                            <input className="p-2 pl-4 bg-gray-100 rounded-full w-full" placeholder="Email Address" type="email" id='email' onChange={(e)=>{setEmail(e.target.value)}} required/>
                            <input className="p-2 pl-4 bg-gray-100 rounded-full w-full" placeholder="Password" type="password" id='pwd' onChange={(e)=>{setPass(e.target.value)}}  pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" minLength={8} required/>
                            <input className="p-2 pl-4 bg-gray-100 rounded-full w-full" placeholder="Phone Number" type="phone" id='phone' onChange={(e)=>{setPhone(e.target.value)}}  pattern="*.[0-9]" minLength={8} required/>
                           <button className="rounded-full w-full">Access Dashboard</button>
                        <h3>Already have an account? <span className=" text-orange-300 cursor-pointer underline underline-offset-0 hover:underline-offset-2 duration-150" onClick={()=>{setIsSigningUp(false)}}>Login</span></h3>
                        <h4 className="cursor-pointer hover:underline duration-150">Forgot Password?</h4>
                        </form>
                    </div>
            </>
        )
    } else{
        return (
                <>
                    <div className="m-auto w-[80%] max-w-48 flex justify-center">
                        <form onSubmit={handleLoginSubmit} className="flex flex-col items-center gap-4 w-72 ">
                            <h1 className="text-3xl font-bold mb-4">Login</h1>
                            <input className="p-2 pl-4 bg-gray-100 rounded-full w-full" placeholder="Email Address" type="email" id='email' onChange={(e)=>{setEmail(e.target.value)}} required/>
                            <input className="p-2 pl-4 bg-gray-100 rounded-full w-full" placeholder="Password" type="password" id='pwd' onChange={(e)=>{setPass(e.target.value)}}  pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" minLength={8} required/>
                            <button className="rounded-full w-full">Access Dashboard</button>
                            <h3>Don't have an account? <span className=" text-orange-300 cursor-pointer underline-offset-0 hover:underline-offset-2 duration-150 underline" onClick={()=>{setIsSigningUp(true)}}>Sign Up</span></h3>
                            <h4 className="cursor-pointer no-underline hover:underline duration-150">Forgot Password?</h4>
                        </form>
                    </div>
                </>
            )
    }
}