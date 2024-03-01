import { signedInUser } from "@/models/user.model"
import Image from "next/image"
import Link from "next/link"

export default function Header({signedInUser}:{signedInUser: signedInUser | null}){
    return (
        <nav className="bg-white sticky -top-1 z-40 flex items-center justify-between px-4 md:px-16 h-12 sm:h-16 border-b-2 border-b-grey-200">
            <Link href={'/'} className="text-2xl font-bold relative w-[120px] sm:w-[175px] h-[16px] md:h-[23px]"><Image src={'/img/logo.png'} fill alt={"The Orderly Logo"}/></Link>
            <span className="flex gap-2 md:gap-4 items-center">
                { 
                    !signedInUser && 
                    <>
                        <Link className="text-darkRed text-md font-semibold hover:text-red" href={`${process.env.NEXT_PUBLIC_BASE_URL}/auth/sign${ typeof window != 'undefined' && '?to=' + location.pathname}`}>Sign in</Link>
                    </>

                }
                {
                    signedInUser && 
                    <>
                        <div className="flex cursor-pointer relative group p-1 md:pr-4 gap-2 bg-gray-100 rounded-full items-center">
                            <div className="w-[30px] h-[30px] md:w-[35px] md:h-[35px] text-white rounded-full overflow-hidden grid place-items-center text-sm md:font-bold bg-red">
                                { signedInUser.firstName[0].toLocaleUpperCase() + signedInUser.lastName![0].toLocaleUpperCase() }
                            </div>
                            <p className="hidden md:block text-sm">Hi, {signedInUser.firstName}</p>
                            <div className="absolute hidden group-hover:flex rounded-lg w-full min-w-[100px] top-[100%] p-1 flex-col bg-gray-100">
                                <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/favs`}><div className="bg-white p-2 border-b-2 border-gray-100 duration-150 hover:bg-peach">Favourites</div></Link>
                                <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/orders`}><div  className="bg-white p-2 border-b-2 border-gray-100 hover:bg-peach">Orders</div></Link>
                                <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/settings`}><div className="bg-white p-2 hover:bg-peach">Settings</div></Link>
                            </div>
                        </div>
                    </>
                }
                <button>Get Orderly</button>
            </span>
        </nav>
    )
}