"use client"
import { clientSupabase } from "@/app/supabase/supabase-client"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { getOrderTotal, styledCedis } from "@/app/utils/frontend/utils"
import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from "@/constants/orderly.store"
import { Tables, TablesUpdate } from "@/types/supabase"
import { setOrders, setProducts } from "@/constants/orderly.slice"
import { accessOrders, getAllProducts, getOrdersWithProductsAndShopperDetails, ordersType } from "@/app/utils/db/supabase-client-queries"
import { popupText } from "@/components/Popup.component"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import { sendText } from "@/app/utils/notifications/phone"
import sendConfirmationEmail from "@/app/utils/notifications/email"

function convertDate(dateString: string){
    let date = new Date(dateString)
    return date.toLocaleDateString()
}

 export default function OrderTabComponent(){
    
    const { shop, orders, products } = useSelector((state: RootState) => state.shopAndUser) 
    const dispatch = useDispatch()

    const [ selectedOrder, setSelectedOrder ] = useState<ordersType[0] | null>(null)
    const [ dataLoading, setLoading ] = useState<boolean>(true)

    const [orderActionProcessing, setOrderActionProcessing ] = useState<boolean>(false)

    const searchParams = useSearchParams()
    const section = searchParams.get('section')
    const router = useRouter()

    const confirmationRef = useRef<HTMLDialogElement>(null)
    const declineRef = useRef<HTMLDialogElement>(null)
    const deliverRef = useRef<HTMLDialogElement>(null)

    useEffect(()=>{
        orders.length == 0 && getOrdersWithProductsAndShopperDetails
        .eq('shop_id', shop.id)
        .then(({data, error}) =>{
            if(error){
                console.log(error)
                popupText(`SB${error.code}: An error occured when fetching the orders`)
            } else {
                dispatch(setOrders(data))
            }
            setLoading(false)
        })

        products.length == 0 && getAllProducts
        .eq('shop_id', shop.id)
        .then(({data, error}) =>{
            if(error){
                console.error(error)
                popupText(`SB${error.code}: An error occured when fetching the shop products`)
            } else  {
                dispatch(setProducts(data!))
            }
        })

    }, [section])

    function handleConfirmOrder(): void{        
        const updateObject: TablesUpdate<'orders'> = {
            status: "CONFIRMED",
            updated_at: new Date().toISOString()
        }

        if(selectedOrder){
            setOrderActionProcessing(true)
            accessOrders
            .update(updateObject)
            .eq('id', selectedOrder!.id)
            .select()
            .then(({data, error}) => {
                //console.log(data)
                if(error){
                    console.error(error)
                    popupText(`SB${error.code}: An error occurred when confirming the order.`)
                } else {
                    //@ts-expect-error
                    sendText(selectedOrder.shopper.phoneNumber, `Your order (#${selectedOrder!.id}) from ${selectedOrder!.shopName} has been confirmed!`)
                    .then(({data, error}) =>{
                        if(error){
                            popupText(`ARK${error.code}: An error occurred when confirming the order`)
                            confirmationRef.current?.close()
                        } else {
                            sendConfirmationEmail(
                                //@ts-ignore
                                selectedOrder.shopper.email, 
                                {
                                    //@ts-ignore
                                    products: selectedOrder.order_products,
                                    shopName: shop.name,
                                    //@ts-ignore
                                    firstName: selectedOrder.shopper.firstName,
                                    //@ts-ignore
                                    order_id: selectedOrder.id,
                                    //@ts-ignore
                                    location: selectedOrder.location
                                })
                                .then(({data, error}) => {
                                    if(error){
                                        console.log(error)
                                        popupText(`RS: An error occurred when confirming the order`)
                                        confirmationRef.current?.close()
                                    } else {
                                        popupText('Order confirmed! The shopper has been notified.')
                                        confirmationRef.current?.close()
                                    }
                                    setOrderActionProcessing(false)
                                })
                        }
                    })
                } 
            })
        } else {
            popupText('No order selected!')
        }
    }

    function handleDeclineOrder(): void{        
        const updateObject: TablesUpdate<'orders'> = {
            status: "DECLINED",
            isActive: false,
            updated_at: new Date().toISOString()
        }

        accessOrders
        .update(updateObject)
        .eq('id', selectedOrder!.id)
        .select()
        .then(({data, error}) => {
            //console.log(data)
            if(error){
                console.error(error)
                popupText(`SB${error.code}: An error occurred when confirming the order.`)
            } else {
                //@ts-expect-error
                sendText(selectedOrder!.shopper.phoneNumber, `Your order (#${selectedOrder!.id}) from ${selectedOrder!.shopName} has been declined.`)
                .then(({data, error}) =>{
                    if(error){
                        popupText(`ARK${error.code}: An error occurred when cdeclining the order`)
                        declineRef.current?.close()
                    } else {
                        popupText('Order Declined. The shopper has been notified.')
                        declineRef.current?.close()
                        router.push('/s/dashboard?tab=orders')
                    }
                })
            }
        })
    }

    function handleDeliverOrder(): void{
        const updateObject: TablesUpdate<'orders'> = {
            status: "ON_DELIVERY",
            isActive: false,
            updated_at: new Date().toISOString()
        }

        accessOrders
        .update(updateObject)
        .eq('id', selectedOrder!.id)
        .select()
        .then(({data, error}) => {
            //console.log(data)
            if(error){
                console.error(error)
                popupText(`SB${error.code}: An error occurred when notifying the customer of your delivery.`)
            } else {
                //@ts-expect-error
                sendText(selectedOrder!.shopper.phoneNumber, `Your order (#${selectedOrder!.id}) from ${selectedOrder!.shopName} is out for delivery!\nYou can verify the delivery at https://orderlygh.shop/order/${selectedOrder!.id}`)
                .then(({data, error}) =>{
                    if(error){
                        popupText(`ARK${error.code}: An error occurred when notifying the customer of your delivery.`)
                        declineRef.current?.close()
                    } else {
                        popupText('Order sent out for delivery. The customer has been notified.')
                        declineRef.current?.close()
                        router.push('/s/dashboard?tab=orders')
                    }
                })
            }
        })
    }


    switch (section){

        case 'order':
            const orderID = searchParams.get('id')
            const order = orders.find((order) => { return order.id.toString() == orderID} ) 

            //console.log(order)
            
            if(order){

                let total = 0;
            
                for(let i = 0; i < order.order_products.length; i++){
                    total += order.order_products[i].price * order.order_products[i].quantity
                }

                return (
                    <>
                        <dialog ref={confirmationRef} className="w-[90%] md:max-w-[400px] rounded-xl overflow-hidden">
                            <div className="p-6 flex flex-col gap-3">
                                <h1 className="text-xl font-semibold">Confirm order #{selectedOrder?.id}?</h1>
                                <p>This will send a notification to the customer confirming their order.</p>
                                <div className="text-lg">
                                    Total: <span className="font-bold ">GHS{styledCedis(total)}</span>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <button className="w-1/2" disabled={orderActionProcessing} onClick={handleConfirmOrder}>
                                        <div style={{display: orderActionProcessing ? 'block' : 'none'}} id="loading"></div>
                                        <span style={{display: orderActionProcessing ? 'none' : 'block'}} >Confirm Order</span>
                                    </button>
                                    <button className="btn-secondary w-1/2" onClick={()=>{confirmationRef.current?.close()}}>Cancel</button>
                                </div>
                            </div>
                        </dialog>

                        <dialog ref={declineRef} className="w-[90%] md:max-w-[400px] rounded-xl overflow-hidden">
                            <div className="p-6 flex flex-col gap-3">
                                <h1 className="text-xl font-semibold">Decline order #{selectedOrder?.id}?</h1>
                                <p>This will send a notification to the customer declining their order.</p>
                                <div className="flex gap-2 mt-2">
                                    <button className="w-1/2" onClick={handleDeclineOrder}>Decline Order</button>
                                    <button className="btn-secondary w-1/2" onClick={()=>{declineRef.current?.close()}}>Cancel</button>
                                </div>
                            </div>
                        </dialog>
                        <dialog ref={deliverRef} className="w-[90%] md:max-w-[400px] rounded-xl overflow-hidden">
                            <div className="p-6 flex flex-col gap-3">
                                <h1 className="text-xl font-semibold">Deliver order #{selectedOrder?.id}?</h1>
                                <p>This will notify the customer that their order is out for delivery.</p>
                                <div className="flex gap-2 mt-2">
                                    <button className="w-1/2" onClick={handleDeliverOrder}>Deliver Order</button>
                                    <button className="btn-secondary w-1/2" onClick={()=>{deliverRef.current?.close()}}>Cancel</button>
                                </div>
                            </div>
                        </dialog>
                        <section className="w-full md:w-[calc(75%+8rem)]">
                            <span className="mb-4 flex gap-4 items-center">
                                <Link href={'/s/dashboard?tab=orders'} className="group p-4 flex h-10 rounded-full items-center justify-center bg-gray-100 hover:bg-gray-300 duration-150"><FontAwesomeIcon className="mr-3 group-hover:mr-2 duration-150" icon={faArrowLeft} /> Back to Orders</Link>
                            </span>
                            <small className="text-md">DETAILS</small>
                            <div className="mt-3">
                                <h1 className="text-4xl font-bold mb-3">Order #{order.id}</h1>
                                <div className="flex items-center gap-4">
                                    <span className={`${order.isActive ? 'bg-red text-white' : 'bg-gray-200 text-gray-400'} p-2 text-xs h-fit rounded-lg`}>{ order.isActive ? 'ACTIVE': 'INACTIVE' }</span>
                                    <span className="text-gray-500 text-xs">{new Date(order.created_at).toLocaleTimeString() + ' ' + convertDate(order.created_at)}{order.isActive ? null : ` - ${new Date(order.updated_at!).toLocaleTimeString() + ' ' + convertDate(order.updated_at!)}`}</span>
                                </div>
                                <div className="mt-6 flex flex-col gap-2 border-2 border-peach rounded-lg overflow-hidden w-full md:max-w-[500px]">
                                    <div className="text-sm bg-peach px-4 py-2">DELIVERY DETAILS</div>
                                    <div className="flex flex-col gap-2">
                                        {/* @ts-ignore */}
                                        <p className="border-b-2 flex justify-between border-b-peach px-4 py-2" ><span className="font-semibold">Name:</span> <span className="text-right">{order.shopper.firstName + ' ' + order.shopper.lastName}</span></p>
                                        {/* @ts-ignore */}
                                        <p  className="border-b-2 flex justify-between border-b-peach px-4 py-2" ><span className="font-semibold">Phone Number:</span> <span className="text-right">{order.shopper.phoneNumber}</span></p>
                                        {/* @ts-ignore */}
                                        <p  className=" px-4 py-2 flex justify-between" ><span className="font-semibold">Location:</span> <span className="text-right">{order.location.buildingNum} {order.location.streetAddress}, {order.location.city}, {order.location.region}, {order.location.country}</span></p>
                                    
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-col gap-2 border-2 border-peach rounded-lg overflow-hidden w-full md:max-w-[500px]">
                                    <div className="text-sm bg-peach px-4 py-2">PRODUCTS ORDERED</div>
                                    <div className="flex flex-col gap-2 w-full md:max-w-[500px] max-h-[400px] overflow-auto">
                                        {
                                            order.order_products.map((product, idx) => {

                                                let specificProduct = products.find((prod) => prod.id == product.product) as Tables<'products'>

                                                return (
                                                    
                                                    <div className="flex items-center py-2 px-4 gap-2 md:gap-4 w-full border-b-peach border-b-2 last:border-b-0" key={idx}>
                                                        <small className="w-[30px] text-center">x{product.quantity}</small>
                                                        <span className="w-[50px] md:w-1/12 flex items-center justify-center">
                                                            <span className="w-[50px] aspect-square rounded-md border-2 border-gray-200 overflow-hidden flex justify-center items-center">
                                                                <img src={specificProduct?.imageURL ?? '/img/chevron-logo.png'} />
                                                            </span>
                                                        </span>
                                                        <h1 className="w-[calc(60%-40px)] md:w-7/12">{specificProduct?.name ?? ''}</h1>
                                                        <p className="w-[calc(40%-40px)] md:w-3/12">GHS{styledCedis(product.price)}</p>

                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                                <div className=" mt-4 flex flex-row-reverse w-full md:max-w-[500px]">
                                    <p className="text-xl">Total: <span className="font-semibold">GHS{styledCedis(total)}</span></p>
                                </div>
                                <div className="mt-4 flex flex-col md:flex-row gap-2 md:gap-4 w-full md:max-w-[500px]">
                                    <span className="w-full md:w-1/2">
                
                                        { order.status == "SENT" &&
                                            <button className="w-full" onClick={(e)=>{e.preventDefault(); setSelectedOrder(order); confirmationRef.current?.showModal()}}>Confirm Order</button>
                                        }
                                        { order.status == "CONFIRMED" &&
                                            <button className="w-full"  onClick={(e)=>{e.preventDefault(); setSelectedOrder(order); deliverRef.current?.showModal()}}>Deliver Order</button>
                                        }
                                        { order.status == "ON_DELIVERY" &&
                                            <button className="w-full">Contact Delivery Rider</button>
                                        }
                                        { order.status == "FULFILLED" &&
                                            <button className="w-full" disabled>Unavailable</button>
                                        }
                                        { order.status == "RETURNED" &&
                                            <button className="w-full" disabled>Close Order</button>
                                        }
                                        { order.status == "DISPUTED" &&
                                            <button className="w-full" disabled>Handle Dispute</button>
                                        }
                                        { order.status == "DECLINED" &&
                                            <button className="w-full" disabled>Order Declined</button>
                                        }

                                    </span>
                                    <button className="w-full md:w-1/2 btn-secondary" disabled={order.status == "DECLINED"} onClick={(e)=>{e.preventDefault(); setSelectedOrder(order); declineRef.current?.showModal()}}>Decline Order</button>
                            
                                </div>
                            </div>
                        </section>
                    </>
                )
            }
            break;

        default:
            return (
                <>  
                    <dialog ref={confirmationRef} className="w-[90%] md:max-w-[400px] rounded-xl overflow-hidden">
                        <div className="p-6 flex flex-col gap-3">
                            <h1 className="text-xl font-medium">Confirm order #{selectedOrder?.id}?</h1>
                            <p>This will send a notification to the customer confirming their order.</p>
                            <div className="max-h-[300px]">
                                {
                                    selectedOrder?.order_products.length != 0 && selectedOrder?.order_products.map((product, idx) => { 
                                        let specificProduct = products.find((prod) => prod.id == product.product) as Tables<'products'> // I'm sorry
                                        return (
                                            <div className="flex py-1 px-2 gap-1 items-center border-2 border-gray-400 border-b-0 last:border-b-2 first:rounded-t-md last:rounded-b-md " key={idx}>
                                                <span className="w-1/12 text-gray-400">x{product.quantity}</span>
                                                <span className="w-7/12">{specificProduct?.name}</span>
                                                <span className="w-4/12 font-bold">GHS{styledCedis(product.price)}</span>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            <div className="flex gap-2 mt-2">
                                <button className="w-1/2">Confirm Order</button>
                                <button className="btn-secondary w-1/2" onClick={()=>{confirmationRef.current?.close()}}>Cancel</button>
                            </div>
                        </div>
                    </dialog>
                    <dialog ref={deliverRef} className="w-[90%] md:max-w-[400px] rounded-xl overflow-hidden">
                            <div className="p-6 flex flex-col gap-3">
                                <h1 className="text-xl font-semibold">Deliver order #{selectedOrder?.id}?</h1>
                                <p>This will notify the customer that their order is out for delivery.</p>
                                <div className="flex gap-2 mt-2">
                                    <button className="w-1/2" onClick={handleDeliverOrder}>Deliver Order</button>
                                    <button className="btn-secondary w-1/2" onClick={()=>{deliverRef.current?.close()}}>Cancel</button>
                                </div>
                            </div>
                        </dialog>
                    <section className="w-full md:w-[calc(75%+8rem)]">
                            <h1 className="font-bold text-2xl mb-8">My Orders ({orders?.length})</h1>
                            <div>
                                <div className="border-2 border-peach rounded-xl">
                                    <div className="bg-peach hidden md:grid grid-cols-orderList gap-6 p-4">
                                        <p className="flex justify-center">ID</p>
                                        <p className="flex justify-center">Date</p>
                                        <p>Order Details</p>
                                        <p className="flex justify-center" >Total</p>
                                        <p className="flex justify-center" >Status</p>
                                        <p className="flex justify-center">Actions</p>
                                    </div>
                                    <div className="max-h-[550px]  overflow-auto">
                                    { dataLoading && 
                                        <>
                                            <div className="flex justify-center text-center animate-pulse w-full p-4">
                                                Loading orders...
                                            </div>
                                        </>
                                    }

                                    { !dataLoading && (orders.length != 0) &&
                                        orders.map((order, idx) => {

                                            let total = getOrderTotal(order)
                                            

                                            return(
                                                <Link href={`/s/dashboard?tab=orders&section=order&id=${order.id}`} key={idx}>
                                                    {/* Desktop */}
                                                    <div className="border-b-peach last:border-b-transparent hover:bg-gray-50 duration-150 hidden md:grid grid-cols-orderList gap-6 p-4" >
                                                        <p className="flex justify-center items-center">#{order.id}</p>
                                                        <p  className="flex justify-center items-center" >{ convertDate(order.created_at)}</p>
                                                        <span className="flex flex-col truncate justify-center">
                                                            { order.shopper && 
                                                                /* @ts-ignore */
                                                                <h1 className="font-semibold text-lg">{order.shopper.firstName + ' ' + order.shopper.lastName} - {order.shopper.phoneNumber}</h1>
                                                            }
                                                            <h2 className="text-gray-400">{order.order_products?.length} Products</h2>
                                                        </span>
                                                        <p className="flex justify-center items-center font-bold">GHS{styledCedis(total)}</p>
                                                        <p className="flex justify-center text-sm items-center" >{order.status}</p>
                                                        <div className="flex items-center justify-center">
                                                            { order.status == "SENT" &&
                                                                <button className="mr-2 btn-secondary" onClick={(e)=>{e.preventDefault(); setSelectedOrder(order); confirmationRef.current?.showModal()}}>Confirm Order</button>
                                                            }
                                                            { order.status == "CONFIRMED" &&
                                                                <button className="mr-2 btn-secondary" onClick={(e)=>{e.preventDefault(); setSelectedOrder(order); deliverRef.current?.showModal()}}>Deliver Order</button>
                                                            }
                                                            { order.status == "ON_DELIVERY" &&
                                                                <button className="mr-2 btn-secondary">Contact Rider</button>
                                                            }
                                                            { order.status == "FULFILLED" &&
                                                                <button className="mr-2 btn-secondary" disabled>Unavailable</button>
                                                            }
                                                            { order.status == "RETURNED" &&
                                                                <button className="mr-2 btn-secondary" disabled>Close Order</button>
                                                            }
                                                            { order.status == "DISPUTED" &&
                                                                <button className="mr-2 btn-secondary" disabled>Handle Dispute</button>
                                                            }
                                                            { order.status == "DECLINED" &&
                                                                <button className="mr-2 btn-secondary" disabled>Order Declined</button>
                                                            }
                                                        </div>
                                                    </div>

                                                    {/* Mobile */}
                                                    <div className="border-b-peach last:border-b-transparent hover:bg-gray-50 duration-150 flex md:hidden flex-col gap-2 p-4" >
                                                        <span className="text-gray-400 w-full flex justify-between">
                                                            <p>#{order.id}</p>
                                                            <p>{convertDate(order.created_at)}</p>
                                                        </span>
                                                        <span >
                                                            {/* @ts-ignore */}
                                                            <p className="text-xl">{order.shopper.firstName + ' ' + order.shopper.lastName}</p>
                                                            {/* @ts-ignore */}
                                                            <p className="mb-1">{order.shopper.phoneNumber}</p>
                                                            <p className="text-gray-400">{order.order_products?.length} Products</p>
                                                            <span className="text-black font-bold">GHS{styledCedis(total)}</span>
                                                        </span>
                                                        <span className="flex gap-4">
                                                            <span className="w-1/2">
                                                                <Link href={`/s/dashboard?tab=orders&section=order&id=${order.id}`}><button className="w-full">View Order</button></Link>
                                                            </span>
                                                            <span className="w-1/2">
            
                                                                { order.status == "SENT" &&
                                                                    <button className="w-full btn-secondary" onClick={(e)=>{e.preventDefault(); setSelectedOrder(order); confirmationRef.current?.showModal()}}>Confirm Order</button>
                                                                }
                                                                { order.status == "CONFIRMED" &&
                                                                    <button className="w-full  btn-secondary" onClick={(e)=>{e.preventDefault(); setSelectedOrder(order); deliverRef.current?.showModal()}}>Deliver Order</button>
                                                                }
                                                                { order.status == "ON_DELIVERY" &&
                                                                    <button className="w-full md:w-fit btn-secondary">Contact Delivery Rider</button>
                                                                }
                                                                { order.status == "FULFILLED" &&
                                                                    <button className="w-full md:w-fit btn-secondary" disabled>Unavailable</button>
                                                                }
                                                                { order.status == "RETURNED" &&
                                                                    <button className="w-full md:w-fit btn-secondary" disabled>Close Order</button>
                                                                }
                                                                { order.status == "DISPUTED" &&
                                                                    <button className="w-full md:w-fit btn-secondary" disabled>Handle Dispute</button>
                                                                }
                                                                { order.status == "DECLINED" &&
                                                                    <button className="w-full md:w-fit btn-secondary" disabled>Order Declined</button>
                                                                }

                                                            </span>
                                                        </span>
                                                    </div>
                                                </Link>
                                            )
                                        })
                                    }
                                    { !dataLoading &&  (orders.length == 0) && 
                                        <>
                                            <div className="flex w-full text-center justify-center p-4">
                                                Oh no! It's empty. You have not recieved any orders yet.
                                            </div>
                                        </> 
                                    }

                                    </div>
                                </div>
                            </div>
                        </section>
                </>
            )
    }
 }