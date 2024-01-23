import { serverSupabase } from "@/app/supabase/supabase-server"
import Footer from "@/components/Footer.component"
import Header from "@/components/Header.component"
import ShopModule from "@/components/shop/ShopModule.component"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"

export default async function Shop({ params }: { params: { shopNameTag: string } }){
    
    const supabase = serverSupabase
    const shopNameTag = params.shopNameTag

    const {data, error} = await supabase.from('shops').select('*').eq('shopNameTag', shopNameTag)

    if (error != null){
        return (
            <>
                <Header />
                <main>
                    <div className="w-screen h-[calc(100vh-137px)] p-8 md:p-12">
                        <div className="flex gap-8 items-center flex-col">
                            <h1 className="font-extrabold text-4xl m-0">500 - Oh no!</h1>
                            <h2 className="text-lg">We're having an issue communicating with our server. Please try again later</h2>
                            <Link href={'/'}><button className="flex items-center gap-2"><span className="w-3 inline-block duration-150"><FontAwesomeIcon icon={faArrowLeft} /></span> Go Back Home</button></Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        )
    } else if(data!.length == 0){
        return(
            <>
                <Header />
                <main>
                    <div className="w-screen h-[calc(100vh-137px)] p-8 md:p-12">
                        <div className="flex gap-8 items-center flex-col">
                            <h1 className="font-extrabold text-4xl m-0">404 - Oh no!</h1>
                            <h2 className="text-lg">The shop <span className="text-red">@{shopNameTag}</span> does not exist.</h2>
                            <Link href={'/'}><button className="flex items-center gap-2"><span className="w-3 inline-block duration-150"><FontAwesomeIcon icon={faArrowLeft} /></span> Go Back Home</button></Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        )
    } else {
        return(
            <>
                <ShopModule selectedShop={data![0]}/>
            </>
        )
    }
}