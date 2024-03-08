"use client"
import { clientSupabase } from "@/app/supabase/supabase-client";
import { styledCedis } from "@/app/utils/frontend/utils";
import Footer from "@/components/Footer.component";
import Header from "@/components/Header.component";
import { popupText } from "@/components/Popup.component";
import { POPUP_STATE } from "@/models/popup.enum";
import { IUserOrder } from "@/models/server.model";
import { signedInUser } from "@/models/user.model";
import { faReceipt} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { useEffect, useState } from "react";


export default function UserOrdersComponent({user}:{user: signedInUser}){

    const [ isLoading, setIsLoading  ] = useState<boolean>(true)
    const [ orders, setOrders ] = useState<IUserOrder[] | null>(null)

    const posthog = usePostHog()
    
    useEffect(() =>{
        posthog.startSessionRecording()

        clientSupabase
        .from('orders')
        .select('*, order_products(price, quantity, product(id, name, imageURL, price, shop_id(shopNameTag))), location(*)')
        .eq('shopper', user.id)
        .returns<IUserOrder[]>()
        .then(({data, error}) => {
            if(error != null){
                popupText(`SB${error.code}: An error occurred`, POPUP_STATE.INFO)
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
                                    <p className="text-gray-400 text-center font-medium m-auto">You have no orders.</p>
                                </>
                            }
                            {
                                !isLoading && orders != null && orders.map((order, idx) =>{

                                    let total = 0
                                    for(let i = 0; i < order.order_products.length; i++){
                                        total += ( order.order_products[i].price * order.order_products[i].quantity )
                                    }
                                    return (
                                        <div className="group rounded-lg duration-150 relative border-[1px] border-gray-200 h-full overflow-hidden flex flex-col" key={idx}>
                                            <div className="bg-white flex gap-1 cursor-pointer items-center justify-between p-2">
                                                <span className="flex flex-col md:flex-row md:gap-2 items-center w-10/12">
                                                    <small className="w-full md:w-1/12 text-xs">#{order.id}</small>
                                                    <h2 className="w-full md:w-6/12 text-lg font-medium">{order.order_products.length} Product(s)</h2>
                                                    <span className="w-full md:w-5/12 flex gap-2 md:gap-4 items-center">
                                                        <span>GHS{styledCedis(total)}</span>
                                                        <span className="text-xs text-red my-auto">{order.status.replace('_', ' ')}</span>
                                                    </span>
                                                </span>
                                                <Link href={`/orders/${order.id}`} className="w-2/12 min-w-[60px] md:min-w-[120px]">
                                                    <button className="w-full">View<span className="hidden md:inline"> Order</span></button>
                                                </Link>
                                            </div>
                                            <div className=" invisible h-0 overflow-hidden group-hover:visible group-hover:h-fit duration-150">
                                                <div className="flex flex-col gap-2 items-center w-full ">
                                                    {   order.order_products.map((ordProduct, idx) => {
                                                        return (
                                                            <div className="w-full" key={idx}>
                                                                 <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/s/${ordProduct.product.shop_id.shopNameTag}/?product=${ordProduct.product.id}`} className="group duration-150 relative bg-white border-t-[1px] border-b-[1px] last:border-b-0 border-gray-200 h-full overflow-hidden flex items-center" key={idx}>
                                                                    <span className="h-[80px] md:h-[90px] w-[80px] md:w-[90px] aspect-square border-r-2 border-gray-200 overflow-hidden flex justify-center items-center">
                                                                        <img src={ordProduct.product.imageURL!} />
                                                                    </span>
                                                                    <div className="w-[calc(100%-100px)] flex flex-col md:flex-row md:justify-between p-2 md:p-4 gap-1 md:gap-2">
                                                                        <h1 className="text-lg leading-5 md:leading-normal mb-0 md:mb-0">{ordProduct.product.name}</h1>
                                                                        <span className="flex flex-row md:justify-end gap-2 items-center md:gap-4">
                                                                            <h3 className="font-medium text-md md:text-lg">GHS{styledCedis(ordProduct.product.price!)}</h3>
                                                                            <span className="text-xs">x{ordProduct.quantity}</span>
                                                                        </span>
                                                                    </div>
                                                                </Link>
                                                            </div>
                                                        )
                                                    })
                                                    }
                                                </div>
                                            </div>
                                        </div>
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