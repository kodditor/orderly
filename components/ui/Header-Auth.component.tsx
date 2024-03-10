"use client"
import { clientSupabase } from "@/app/supabase/supabase-client";
import type { signedInUser } from "@/models/user.model";
import { faHeart, faReceipt, faCog, faChevronDown, faUserCircle, faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as Sentry from '@sentry/nextjs'
import Link from "next/link";

import { popupText } from "../Popup.component";
import { useRouter } from "next/navigation";


export default function HeaderAuth({signedInUser}:{signedInUser: signedInUser | null}){

    const router = useRouter()

    function signOut(){
        clientSupabase.auth.signOut().then(({error}) =>{
            if(error != null){
                popupText(`SB${error.status}:An error occurred while logging out`)
                Sentry.captureException(new Error(`SB${error.status}:${error.cause}, ${error.message}`))
            } else {
                router.push('/')
            }
        })

    }

    if(signedInUser == null){
        return (
            <>
                <span className="flex gap-2 md:gap-4 items-center">
                    <Link className="text-darkRed text-md font-semibold hover:text-red" href={`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login${ typeof window != 'undefined' ? '?to=' + location.pathname : '' }`}>Log in</Link>
                    <Link href={'/auth/signup?to=/onboarding'}>
                        <button>Get Orderly</button>
                    </Link>
                </span>
            </>
        )
    }

    return (
        <>
            <span className="flex gap-2 md:gap-4 items-center">
                <div className="group flex cursor-pointer relative group py-2 px-2 md:px-4 duration-150 gap-2 rounded-full items-center">
                    <p className="hidden md:block text-sm">Hi, <span className="font-semibold">{signedInUser.firstName}</span></p>
                    <FontAwesomeIcon className="md:hidden text-gray-400" width={15} height={15} icon={faUserCircle} />
                    <FontAwesomeIcon className="relative group-hover:top-[1.5px] duration-150" width={12} height={12} icon={faChevronDown} />
                    <div className="absolute hidden group-hover:block w-full min-w-[130px] pt-2 text-darkRed top-[100%] -left-4">
                        <div className="flex flex-col p-[2px] rounded-lg w-full bg-gray-100"> 
                            <Link href={`/favs`}>
                                <div className="bg-white flex items-center gap-3 p-2 border-b-2 border-gray-100 duration-150 hover:bg-peach">
                                    <FontAwesomeIcon width={12} height={12} icon={faHeart} />
                                    <span>Favourites</span>
                                </div>
                            </Link>
                            <Link href={`/orders`}>
                                <div  className="bg-white p-2 border-b-2 border-gray-100 hover:bg-peach flex items-center gap-3">
                                    <FontAwesomeIcon width={12} height={12} icon={faReceipt} />
                                    <span>Orders</span>
                                </div>
                            </Link>
                            <Link href={`/settings`}>
                                <div className="bg-white p-2 hover:bg-peach flex items-center gap-3">
                                    <FontAwesomeIcon width={12} height={12} icon={faCog} />
                                    <span>Settings</span>
                                </div>
                            </Link>
                            <div onClick={signOut}>
                                <div className="bg-white p-2 hover:bg-red hover:text-white text-red flex items-center gap-3 rounded-b-lg">
                                    <FontAwesomeIcon width={12} height={12} icon={faArrowRightFromBracket} />
                                    <span>Logout</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                { 
                    typeof signedInUser.shop_id == 'undefined' || !signedInUser.shop_id &&
                    <Link href={'/s/onboarding'}>
                        <button>Get Orderly</button>
                    </Link>
                }
                { 
                    typeof signedInUser.shop_id != 'undefined' && signedInUser.shop_id &&
                    <Link href={'/s/dashboard'}>
                        <button>Dashboard</button>
                    </Link>
                }
            </span>
        </>
    )

}