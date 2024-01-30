import Image from "next/image"

export default function Header(){
    return (
        <nav className="bg-white sticky top-0 z-40 flex items-center justify-between px-2 md:px-16 h-16 border-b-2 border-b-grey-200">
            <span className="text-2xl font-bold"><Image src={'/img/logo.png'} width={175} height={50} alt={"The Orderly Logo"}/></span>
            <span>
                <button>Get Orderly</button>
            </span>
        </nav>
    )
}