import { faInstagram, faFacebook, faXTwitter, faTiktok } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";

export default function Footer(){
    
    let today = new Date()

    return (
        <>
            <footer className="flex flex-col gap-8 md:gap-0 md:flex-row items-center justify-between p-5 z-50 relative bg-black w-[100%]">
                <div className="relative w-[120px] sm:w-[150px] h-[15px] sm:h-[20px]"><Image src={'/img/logo-white.png'} fill alt="The Orderly Logo" /> </div>
                <div className="flex flex-col-reverse md:flex-row gap-8 md:gap-4 items-center">
                    <p className="text-center text-white md:pr-5 md:border-r-white md:border-r-[1.5px]">Orderly Ghana &copy; {today.getFullYear()}</p>
                    <div className="flex gap-4 items-center">
                        <a href="https://instagram.com/orderlyghana" className="bg-black hover:bg-white hover:text-black duration-150 cursor-pointer w-8 h-8 rounded-full flex items-center justify-center text-white p-2" ><FontAwesomeIcon icon={faInstagram} /></a>
                        <a  className="bg-black hover:bg-white hover:text-black duration-150 cursor-pointer w-8 h-8 p-2 rounded-full flex items-center justify-center text-white" ><FontAwesomeIcon icon={faFacebook} /></a>
                        <a  className="bg-black hover:bg-white hover:text-black duration-150 cursor-pointer w-8 h-8 p-2 rounded-full flex items-center justify-center text-white" ><FontAwesomeIcon icon={faXTwitter} /></a>
                        <a  className="bg-black hover:bg-white hover:text-black duration-150 cursor-pointer w-7 h-7 p-2 rounded-full flex items-center justify-center text-white" ><FontAwesomeIcon icon={faTiktok} /></a>
                    </div>
                </div>
            </footer>
        </>
    )
}