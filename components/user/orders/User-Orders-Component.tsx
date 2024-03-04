"use client"
import { clientSupabase } from "@/app/supabase/supabase-client";
import { styledCedis } from "@/app/utils/frontend/utils";
import Footer from "@/components/Footer.component";
import Header from "@/components/Header.component";
import { popupText } from "@/components/Popup.component";
import { IUserOrder } from "@/models/server.model";
import { signedInUser } from "@/models/user.model";
import { faReceipt} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";


export default function UserOrdersComponent({user}:{user: signedInUser}){

    const [ isLoading, setIsLoading  ] = useState<boolean>(true)
    const [ orders, setOrders ] = useState<IUserOrder[] | null>(null)

    useEffect(() =>{
        clientSupabase
        .from('orders')
        .select('*, order_products(price, quantity, product(name, imageURl)), location(*)')
        .eq('shopper', user.id)
        .returns<IUserOrder[]>()
        .then(({data, error}) => {
            if(error != null){
                popupText(`SB${error.code}: An error occurred`)
            }
            else {
                setOrders(data)
            }
            setIsLoading(false)
        })
    }, [])

    return (
        <>
            <Header signedInUser={user} />
            <main className="w-screen min-h-[calc(100vh-50px-173px)] md:min-h-[calc(100vh-70px-66px)] bg-gray-50 grid place-items-center">
                <div className="w-full bg-white p-4 md:p-8 md:shadow-md md:rounded-xl md:max-w-[800px] md:overflow-auto h-full md:max-h-[550px]">
                    <div className="h-fit">
                        <span className="mt-2 mb-2 md:mb-4 flex items-center gap-2">
                            <FontAwesomeIcon width={25} height={25} className="text-red" icon={faReceipt} />
                            <h1 className="font-bold text-xl  md:text-2xl">My Orders</h1>
                        </span>
                        <div className="bg-gray-50 rounded-lg w-full min-h-[400px]  mb-4 overflow-auto flex flex-col gap-3 p-2">
                            {
                                isLoading && 
                                <>
                                    <p className="text-gray-400 text-center animate-pulse font-medium m-auto">Loading your orders...</p>
                                </>
                            }
                            {
                                !isLoading && (orders?.length == 0 || orders == null) &&
                                <>
                                    <p className="text-gray-400 text-center animate-pulse font-medium m-auto">You have no orders.</p>
                                </>
                            }
                            {
                                !isLoading && orders != null && orders.map((fav, idx) =>{
                                    return (
                                        <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/s/`} className="group rounded-lg duration-150 relative bg-white border-[1px] border-gray-200 h-full overflow-hidden flex items-center" key={idx}>
                                            
                                        </Link>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )

}