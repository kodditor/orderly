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


export default function DashboardHeader(){

    const {shop, user} = useSelector((state: RootState) => state.shopAndUser)
    const router = useRouter()
    const supabase = clientSupabase

    const [ clickedOpenNav, setClickedOpenNav ] = useState<boolean>(false)

    let today = new Date()

    function handleSignOut(){
        supabase.auth.signOut().then((data) => {
            router.push('/')
        })
    }

    return (
        <> 
            <nav className="hidden md:flex flex-col fixed py-8 justify-between w-[30vh] min-w-[240px] top-0 h-screen min-h-[500px] border-r-2 border-peach overflow-auto ">
                <div>
                    <Link href={'/'} className="w-full flex justify-center px-4 pb-8 border-b-2 border-b-peach"><Image src={'/img/logo.png'} width={170} height={50} alt="The Orderly Logo"/></Link>
                    <ul className="px-4 mt-8 mb-4">
                        <Link href={'/s/dashboard'} className="w-full"><li className="flex items-center hover:bg-peach p-3 pl-5 border-b-2 border-b-peach rounded-full duration-150"><FontAwesomeIcon className="mr-2" icon={faHome} />My Dashboard</li></Link>
                        <Link href={'?tab=products'} className="w-full "><li className="flex items-center hover:bg-peach p-3 pl-5 border-b-2 border-b-peach rounded-full duration-150"><FontAwesomeIcon className="mr-3" icon={faShoppingBag} />My Products</li></Link>
                        <Link href={'?tab=orders'} className="w-full "><li className="flex items-center hover:bg-peach p-3 pl-5 border-b-2 border-b-peach rounded-full duration-150"><FontAwesomeIcon className="mr-3" icon={faReceipt} />My Orders</li></Link>
                        <Link href={'?tab=settings'} className="w-full "><li className="flex items-center hover:bg-peach p-2 border-b-2 border-b-peach rounded-full duration-150"><span className="mr-[7px] w-[30px] h-[30px] rounded-full overflow-hidden" ><Image src={shop.imageURL!} alt="Visit your shop" width={30} height={30} /></span>My Settings</li></Link>
                    
                    </ul>
                </div>
                <div className="w-full px-4 flex flex-col gap-3">
                    <Link href={`/s/${shop.shopNameTag}`}><button className="w-full">Visit My Shop</button></Link>
                    <button className="btn-secondary !bg-peach hover:!bg-darkRed !border-peach hover:!border-darkRed" onClick={handleSignOut}>Log Out</button>
                    <p className="text-center">Orderly Ghana &copy; {today.getFullYear()}</p>
                    <div className="flex justify-evenly w-full">
                        <a href="https://instagram.com/orderlyghana" className="bg-black hover:bg-peach hover:text-black duration-150 cursor-pointer w-8 h-8 rounded-full flex items-center justify-center text-white" ><FontAwesomeIcon icon={faInstagram} /></a>
                        <a  className="bg-black hover:bg-peach hover:text-black duration-150 cursor-pointer w-8 h-8 rounded-full flex items-center justify-center text-white" ><FontAwesomeIcon icon={faFacebook} /></a>
                        <a  className="bg-black hover:bg-peach hover:text-black duration-150 cursor-pointer w-8 h-8 rounded-full flex items-center justify-center text-white" ><FontAwesomeIcon icon={faXTwitter} /></a>
                        <a  className="bg-black hover:bg-peach hover:text-black duration-150 cursor-pointer w-8 h-8 rounded-full flex items-center justify-center text-white" ><FontAwesomeIcon icon={faTiktok} /></a>
                    </div>
                </div>    
            </nav>
            <nav className="flex md:hidden shadow-sm bg-white fixed top-0 w-screen h-[50px] z-40 border-2 border-peach px-4 py-2 justify-between">
                <Link href={`/`} className="w-full flex items-center"><Image src={'/img/logo.png'} width={170} height={50} alt="The Orderly Logo"/></Link>
                <div className="flex items-center gap-4">
                    <Link href={`/s/${shop.shopNameTag}`} className="w-[30px] h-[30px] rounded-full overflow-hidden border-1 border-black"><Image src={shop.imageURL!} alt="Visit your shop" width={50} height={50} /></Link>
                    <FontAwesomeIcon className="cursor-pointer" onClick={()=>{setClickedOpenNav(true)}} icon={faBars} />
                </div>
                <div className={`w-screen h-screen top-0 left-0 fixed bg-black text-white ${(clickedOpenNav) ? 'flex flex-col' : 'hidden'}`}>
                    <ul className="flex flex-col w-2/3 min-w-[175px] m-auto gap-6">
                        <span className="flex justify-center text-2xl mb-2 " onClick={()=>{setClickedOpenNav(false)}}><FontAwesomeIcon icon={faClose} /></span>
                        <Link href={'/s/dashboard'} onClick={()=>{setClickedOpenNav(false)}}><li className="flex items-center justify-center hover:bg-peach p-3 border-2 border-b-peach rounded-full duration-150"><FontAwesomeIcon className="mr-3" icon={faHome} />My Dashboard</li></Link>
                        <Link href={'?tab=products'} onClick={()=>{setClickedOpenNav(false)}} className="w-full "><li className="flex justify-center items-center hover:bg-peach p-3 border-2 border-b-peach rounded-full duration-150"><FontAwesomeIcon className="mr-3" icon={faShoppingBag} />My Products</li></Link>
                        <Link href={'?tab=orders'} onClick={()=>{setClickedOpenNav(false)}} className="w-full "><li className="flex items-center justify-center hover:bg-peach p-3 border-2 border-b-peach rounded-full duration-150"><FontAwesomeIcon className="mr-3" icon={faReceipt} />My Orders</li></Link>
                        <Link href={'?tab=settings'} onClick={()=>{setClickedOpenNav(false)}} className="w-full "><li className="flex items-center justify-center hover:bg-peach p-3 border-2 border-b-peach rounded-full duration-150"><FontAwesomeIcon className="mr-3" icon={faCog} />My Settings</li></Link>
                        <Link href={`/s/${shop.shopNameTag}`} onClick={()=>{setClickedOpenNav(false)}}><button className="w-full btn-no-shadow">Visit My Shop</button></Link>
                        <button className="btn-secondary btn-no-shadow" onClick={handleSignOut}>Log Out</button>
                        <p className="text-center">Orderly Ghana &copy; {today.getFullYear()}</p>
                        <div className="flex justify-evenly w-full">
                            <a href="https://instagram.com/orderlyghana" className="bg-black hover:bg-peach hover:text-black duration-150 cursor-pointer w-8 h-8 rounded-full flex items-center justify-center text-white" ><FontAwesomeIcon icon={faInstagram} /></a>
                            <a  className="bg-black hover:bg-peach hover:text-black duration-150 cursor-pointer w-8 h-8 rounded-full flex items-center justify-center text-white" ><FontAwesomeIcon icon={faFacebook} /></a>
                            <a  className="bg-black hover:bg-peach hover:text-black duration-150 cursor-pointer w-8 h-8 rounded-full flex items-center justify-center text-white" ><FontAwesomeIcon icon={faXTwitter} /></a>
                            <a  className="bg-black hover:bg-peach hover:text-black duration-150 cursor-pointer w-8 h-8 rounded-full flex items-center justify-center text-white" ><FontAwesomeIcon icon={faTiktok} /></a>
                        </div>
                    </ul>
                </div>
            </nav>
        </>
    )

}