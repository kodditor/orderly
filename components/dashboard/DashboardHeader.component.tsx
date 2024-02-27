"use client"
import { clientSupabase } from "@/app/supabase/supabase-client"
import type { RootState } from "@/constants/orderly.store"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSelector } from 'react-redux'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars, faClose, faCog, faHome, faReceipt, faShoppingBag } from "@fortawesome/free-solid-svg-icons"
import { faInstagram, faFacebook, faXTwitter, faTiktok } from "@fortawesome/free-brands-svg-icons"
import { useState } from "react"
import { popupText } from "../Popup.component"


export default function DashboardHeader(){

    const {shop, user} = useSelector((state: RootState) => state.shopAndUser)
    const router = useRouter()
    const supabase = clientSupabase

    const [ clickedOpenNav, setClickedOpenNav ] = useState<boolean>(false)

    let today = new Date()

    function handleSignOut(){
        supabase.auth.signOut().then((data) => {
            router.push('/')
            popupText('You signed out')
        })
    }

    return (
        <> 
            <nav className="hidden md:flex flex-col fixed py-8 justify-between w-[30vh] min-w-[240px] top-0 h-screen min-h-[500px] border-r-2 border-peach overflow-auto ">
                <div>
                    <Link href={'/'} className="w-full flex justify-center px-4 pb-8 border-b-2 border-b-peach"><Image src={'/img/logo.png'} width={170} height={50} alt="The Orderly Logo"/></Link>
                    <ul className="px-4 mt-8 mb-4">
                        <Link href={'/s/dashboard'} className="w-full"><li className="flex items-center hover:bg-peach p-3 pl-5 border-b-2 border-b-peach rounded-full duration-150"><FontAwesomeIcon className="mr-2" width={15} height={15} icon={faHome} />My Dashboard</li></Link>
                        <Link href={'?tab=products'} className="w-full "><li className="flex items-center hover:bg-peach p-3 pl-5 border-b-2 border-b-peach rounded-full duration-150"><FontAwesomeIcon className="mr-3" width={15} height={15} icon={faShoppingBag} />My Products</li></Link>
                        <Link href={'?tab=orders'} className="w-full "><li className="flex items-center hover:bg-peach p-3 pl-5 border-b-2 border-b-peach rounded-full duration-150"><FontAwesomeIcon className="mr-3" width={15} height={15} icon={faReceipt} />My Orders</li></Link>
                        <Link href={'?tab=settings'} className="w-full "><li className="flex items-center hover:bg-peach p-2 border-b-2 border-b-peach rounded-full duration-150"><span className="ml-[7px] mr-[7px] w-[25px] h-[25px] rounded-full overflow-hidden" ><Image src={shop.imageURL!} alt="Visit your shop" width={25} height={25} /></span>My Settings</li></Link>
                    
                    </ul>
                </div>
                <div className="w-full px-4 flex flex-col gap-3">
                    <Link href={`/s/${shop.shopNameTag}`} target="_blank"><button className="w-full">Visit My Shop</button></Link>
                    <button className="btn-secondary !bg-peach hover:!bg-darkRed !border-peach hover:!border-darkRed" onClick={handleSignOut}>Log Out</button>
                    <p className="text-center">Orderly Ghana &copy; {today.getFullYear()}</p>
                    <div className="flex justify-evenly w-full">
                        <a href="https://instagram.com/orderlyghana" className="bg-black hover:bg-peach hover:text-black duration-150 cursor-pointer w-8 h-8 rounded-full flex items-center justify-center text-white" ><FontAwesomeIcon icon={faInstagram} /></a>
                        <a  className="bg-black hover:bg-peach hover:text-black duration-150 cursor-pointer w-8 h-8 rounded-full flex items-center justify-center text-white" ><FontAwesomeIcon width={15} height={15} icon={faFacebook} /></a>
                        <a  className="bg-black hover:bg-peach hover:text-black duration-150 cursor-pointer w-8 h-8 rounded-full flex items-center justify-center text-white" ><FontAwesomeIcon width={15} height={15} icon={faXTwitter} /></a>
                        <a  className="bg-black hover:bg-peach hover:text-black duration-150 cursor-pointer w-8 h-8 rounded-full flex items-center justify-center text-white" ><FontAwesomeIcon width={15} height={15} icon={faTiktok} /></a>
                    </div>
                </div>    
            </nav>
            <nav className="flex md:hidden shadow-sm bg-white fixed top-0 w-screen h-[50px] z-50 border-2 border-peach px-4 py-2 justify-between">
                <Link href={`/`} className="w-full flex items-center"><Image src={'/img/logo.png'} width={170} height={50} alt="The Orderly Logo"/></Link>
                <div className="flex items-center gap-4">
                    <Link href={`/s/${shop.shopNameTag}`} className="w-[30px] h-[30px] rounded-full overflow-hidden border-1 border-black"><Image src={shop.imageURL!} alt="Visit your shop" width={30} height={30} /></Link>
                    <FontAwesomeIcon className="cursor-pointer" onClick={()=>{clickedOpenNav ? setClickedOpenNav(false) :setClickedOpenNav(true)}} width={12} height={12} icon={ clickedOpenNav ? faClose : faBars} />
                </div>
                <div className={`w-fit h-fit top-12 right-3 fixed p-2 rounded-3xl border-2 border-gray-300 overflow-hidden bg-gray-50 text-black ${(clickedOpenNav) ? 'flex flex-col' : 'hidden'}`}>
                    <ul className="flex flex-col m-auto gap-2">
                        <Link href={`/s/${shop.shopNameTag}`} onClick={()=>{setClickedOpenNav(false)}}><button className="w-full btn-no-shadow">Visit My Shop</button></Link>
                        <button className="btn-secondary" onClick={handleSignOut}>Log Out</button>
                    </ul>
                </div>
                <div className="fixed md:hidden border-t-peach border-t-2 z-50 bg-white -bottom-1 p-2 grid place-items-center left-0 w-full h-[70px]">
                    <ul className="w-full flex justify-evenly text-darkRed">
                        <Link href={'/s/dashboard'}>
                            <li className="flex flex-col justify-center items-center gap-1 hover:text-red duration-150" >
                                <FontAwesomeIcon width={70} height={70} icon={faHome} />
                                <span>Home</span>
                            </li>
                        </Link>
                        <Link href={'?tab=products'}>
                            <li className="flex flex-col justify-center gap-1 items-center hover:text-red duration-150" >
                                <FontAwesomeIcon width={70} height={70} icon={faShoppingBag} />
                                <span>Products</span>
                            </li>
                        </Link>
                        <Link href={'?tab=orders'}>
                            <li className="flex flex-col justify-center gap-1 items-center hover:text-red duration-150" >
                                <FontAwesomeIcon width={70} height={70} icon={faReceipt} />
                                <span>Orders</span>
                            </li>
                        </Link>
                        <Link href={'?tab=settings'}>
                            <li className="flex flex-col justify-center gap-1 items-center hover:text-red duration-150" >
                                <FontAwesomeIcon width={70} height={70} icon={faCog} />
                                <span>Settings</span>
                            </li>
                        </Link>
                    </ul>
                </div>
            </nav>
        </>
    )

}