import { signedInUser } from "@/models/user.model"
import { faCog, faHeart, faReceipt } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Image from "next/image"
import Link from "next/link"
import HeaderAuth from "./ui/Header-Auth.component"

export default function Header({signedInUser}:{signedInUser: signedInUser | null}){
    return (
        <nav className="bg-white sticky -top-1 z-40 flex items-center justify-between px-4 md:px-16 h-12 sm:h-16 border-b-2 border-b-grey-200">
            <Link href={'/'} className="text-2xl font-bold relative w-[120px] sm:w-[175px] h-[16px] md:h-[23px]"><Image src={'/img/logo.png'} fill alt={"The Orderly Logo"}/></Link>

            <HeaderAuth signedInUser={signedInUser} />
        </nav>
    )
}