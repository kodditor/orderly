"use client"
import { clientSupabase } from "@/app/supabase/supabase-client"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { pesewasToCedis } from "@/app/utils/frontend/utils"
import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from "@/constants/orderly.store"
import { Tables } from "@/types/supabase"
import { setOrders, removeOrder } from "@/constants/orderly.slice"
import { User } from "@supabase/auth-helpers-nextjs"

function convertDate(dateString: string){
    let date = new Date(dateString)
    return date.toLocaleDateString()
}

 export default function OrderTabComponent(){
    
    const {shop, user, orders, products} = useSelector((state: RootState) => state.shopAndUser) 
    const dispatch = useDispatch()

    const [ dataLoading, setLoading ] = useState<boolean>(true)
    const [ selectedOrder, setSelectedOrder ] = useState<Tables<'orders'>| null >(null)

    const [ genError, setError ] = useState<boolean>(false)

    const supabase = clientSupabase;

    useEffect(()=>{
        supabase
        .from('orders')
        .select('*')
        .eq('shop_id', shop.id)
        .then(({data, error}) =>{
            if(!error){
                dispatch(setOrders(data!))
                setLoading(false)
            } else {
                setError(true)
                setLoading(false)
            }
        })

    }, [])

    const tempOrder: Tables<'orders'>[] = [
        {
            created_at: new Date().toISOString(),
            id: 209,
            product_ids: [],
            shop_id: shop.id,
            shopper:  null,
            shopper_id: 'akdfna04',
            status: 'SENT',
            total: 10024,
            updated_at: new Date().toISOString()
          }
    ]

    function getShopper(shopper_id: string){
        let user:User | null = null
        supabase
        .auth
        .admin.getUserById(shopper_id) // This should not be called in a rsc
        .then(({data, error}) => {
            if(!error) user = data.user
            else console.log(error)
        })
        return user
    }

    return (
        <>
             <section className="w-[calc(75%+8rem)]">
                    <h1 className="font-bold text-2xl mb-8">My Orders</h1>
                    <div>
                        <div className="border-2 border-peach rounded-xl">
                            <div className="bg-peach grid grid-cols-orderList gap-6 p-4">
                                <p className="flex justify-center">Order #</p>
                                <p className="flex justify-center">Date</p>
                                <p>Client Details and Order Products</p>
                                <p className="flex justify-center" >Total</p>
                                <p className="flex justify-center" >Status</p>
                                <p className="flex justify-center">Actions</p>
                            </div>
                            <div className="max-h-[550px]  overflow-auto">
                            { dataLoading && 
                                <>
                                    <div className="flex justify-center animate-pulse w-full p-4">
                                        Loading...
                                    </div>
                                </>
                            }

                            { (!dataLoading) && (orders!.length == 0) &&
                                tempOrder!.map((order, idx) => {
                                    return(
                                        <div className="border-b-peach last:border-b-transparent hover:bg-gray-50 duration-150 grid grid-cols-orderList gap-6 p-4" key={idx}>
                                            <p className="flex justify-center items-center"># {order.id}</p>
                                            <p  className="flex justify-center items-center" >{ convertDate(order.created_at)}</p>
                                            <span className="flex flex-col truncate justify-center">
                                                { order.shopper && (order.shopper_id == null) && 
                                                    <h1 className="font-black text-xl">{order.shopper?.name} - {order.shopper?.phone}</h1>
                                                }
                                                <h2 className="text-gray-400">{order.product_ids?.length} Products</h2>
                                            </span>
                                            <p className="flex justify-center items-center font-black">GHS{pesewasToCedis(order.total!).toFixed(2).toLocaleString()}</p>
                                            <p className="flex justify-center items-center font-bold" >{order.status}</p>
                                            { order.status == "SENT" &&
                                                <button className="mr-2 btn-secondary">Confirm Order</button>
                                            }
                                            { order.status == "CONFIRMED" &&
                                                <button className="mr-2 btn-secondary" disabled>Deliver Order</button>
                                            }
                                            { order.status == "ON_DELIVERY" &&
                                                <button className="mr-2 btn-secondary">Contact Delivery Rider</button>
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
                                        </div>
                                    )
                                })
                            }
                            { !dataLoading &&  orders!.length != 0 && 
                                <>
                                    <div className="flex w-full justify-center p-4">
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