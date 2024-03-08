"use client"
import { IOrderDetails } from "@/models/OrderProducts.model";
import Footer from "./Footer.component";
import Header from "./Header.component";
import { styledCedis } from "@/app/utils/frontend/utils";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { signedInUser } from "@/models/user.model";
import { usePostHog } from "posthog-js/react";


export default function OrderDetailsComponent({order, signedInUser}: {order: IOrderDetails, signedInUser:signedInUser}){

    let totalCost = 0
    for (let i=0; i < order.order_products.length; i++){
        totalCost += (order.order_products[i].price * order.order_products[i].quantity)
    }

    const confirmRef = useRef<HTMLDialogElement>(null)
    
    const posthog = usePostHog()
    useEffect(() => {
        posthog.startSessionRecording()
    })

    function handleConfirmDelivery(){
        throw new Error("Confirm delivery not implemented")
    }


    return (
        <>

            <dialog ref={confirmRef} className="w-[90%] md:max-w-[400px] rounded-xl overflow-hidden">
                <div className="p-6 flex flex-col gap-2">
                    <h1 className="text-lg font-semibold">Confirm the deliver of order #{order.id}?</h1>
                    <p>This will notify the shop that you have received the package.</p>
                    <div className="flex gap-2 mt-1">
                        <button className="w-1/2" onClick={handleConfirmDelivery}>Confirm</button>
                        <button className="btn-secondary w-1/2" onClick={()=>{confirmRef.current?.close()}}>Cancel</button>
                    </div>
                </div>
            </dialog>

            <Header signedInUser={signedInUser} />
            <main className="w-screen h-[calc(100vh-50px-173px)] md:h-[calc(100vh-70px-66px)] bg-gray-50 grid place-items-center">
                <div className="w-full bg-white p-4 md:p-8 md:shadow-md md:rounded-xl md:max-w-[800px] md:overflow-auto h-full md:max-h-[550px]">
                    <div className="h-fit">
                        <p className="text-xs text-darkRed bg-peach px-2 py-1 rounded-full inline">ORDER #{order.id}</p>
                            { 
                                order.status == 'SENT' && <h1 className="font-bold text-xl mt-2 md:text-2xl mb-2 md:mb-4">Your order is awaiting confirmation.</h1> ||
                                order.status == 'DECLINED' && <h1 className="font-bold mt-2 text-xl md:text-2xl mb-2 md:mb-4">Your order has been declined by the shop.</h1> ||
                                order.status == 'CONFIRMED' && <h1 className="font-bold mt-2 text-xl md:text-2xl mb-2 md:mb-4">Your order has been confirmed. Sit tight!</h1> ||
                                order.status == 'ON_DELIVERY' && <h1 className="font-bold mt-2 text-xl md:text-2xl mb-2 md:mb-4">Your order is out for delivery! <br />You can confirm the delivery or your order here.</h1> ||
                                order.status == 'FULFILLED' && <h1 className="font-bold mt-2 text-xl md:text-2xl mb-2 md:mb-4">Your order has been fulfilled. <br />Thanks for shopping with Orderly!</h1> ||
                                order.status == 'DISPUTED' && <h1 className="font-bold mt-2 text-xl md:text-2xl mb-2 md:mb-4">We're working to resolve you dispute. Sit tight!</h1> 
                            }
                        <small className="text-red">ORDER PRODUCTS</small>
                        <div className="flex gap-2 flex-col max-h-[300px] overflow-auto mt-2 mb-4 bg-gray-50">
                            {
                                order.order_products.map((product, idx) => {
                                    return (
                                        <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/s/${order.shop_id.shopNameTag}/?product=${product.product.id}`} className="group rounded-lg duration-150 relative bg-white border-[1px] border-gray-200 overflow-hidden flex items-center" key={idx}>
                                            <span className="h-[80px] md:h-[90px] w-[80px] md:w-[90px] aspect-square border-r-2 border-gray-200 overflow-hidden flex justify-center items-center">
                                                <img src={product.product.imageURL!} />
                                            </span>
                                            <div className="w-[calc(100%-100px)] flex flex-col md:flex-row md:justify-between p-2 md:p-4 gap-0 md:gap-2">
                                                <h1 className="text-lg leading-5 md:leading-normal mb-0 md:mb-0">{product.product.name}</h1>
                                                <span className="flex flex-col md:flex-row md:items-center gap-0 md:gap-4">
                                                    <small className="text-gray-500">x{product.quantity}</small>
                                                    <h3 className="font-medium text-md md:text-lg">GHS{styledCedis(product.price)}</h3>
                                                </span>
                                            </div>
                                        </Link>
                                    )
                                })
                            }
                        </div>
                        <small className="text-red">DELIVERY DETAILS</small>
                        <div>
                            <p>{`${order.shopper.firstName} ${order.shopper.lastName} - (${order.shopper.phoneNumber}${order.shopper.email ? " ," + order.shopper.email: ""})`}</p>
                            <p></p>
                            <p></p>
                            <p>{`${order.location.buildingNum ? order.location.buildingNum + " " : ""}${order.location.streetAddress}, ${order.location.city}`}<br/>{`${order.location.region}, ${order.location.country}`}</p>
                        </div>
                        <div className="mt-4 flex mr-6">
                            <span>
                                <span className="mr-1">Total:</span>
                                <span className="text-lg font-bold">GHS{styledCedis(totalCost)}</span>
                            </span>
                        </div>
                        <div className="mt-2 flex w-full md:w-fit">
                            <div className="w-full">
                                { 
                                    order.status == 'SENT' && <></> ||
                                    order.status == 'DECLINED' && <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/s/${order.shop_id.shopNameTag}`}><button className="w-full md:w-fit">Back to shop</button></Link> ||
                                    order.status == 'CONFIRMED' && <></> ||
                                    order.status == 'ON_DELIVERY' && <button className="w-full md:w-fit" onClick={()=>{confirmRef.current?.showModal()}}>I have received my order</button> ||
                                    order.status == 'FULFILLED' && <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/s/${order.shop_id.shopNameTag}`}><button className="w-full md:w-fit">Back to shop</button></Link>||
                                    order.status == 'DISPUTED' && <></>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )

}