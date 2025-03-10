"use client"
import { clientSupabase } from "@/app/supabase/supabase-client"
import type { RootState } from "@/constants/orderly.store"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, SetStateAction } from "react"
import { popupText } from "../Popup.component"
import { setOrders } from "@/constants/orderly.slice"
import { getOrdersWithProductsAndShopperDetails } from "@/app/utils/db/supabase-client-queries"
import {  sortByDateUpdated, styledCedis } from "@/app/utils/frontend/utils"
import { POPUP_STATE } from "@/models/popup.enum"
import { usePostHog } from "posthog-js/react"

export default function DashboardTabComponent (){

    const {shop, user, orders, products} = useSelector((state: RootState) => state.shopAndUser)
    const dispatch = useDispatch()
    const [ productsNum, setProductsNum ] = useState<number>(0)
    const [ ordersNum, setOrdersNum ] = useState<number>(0)
    const [ totalRevenue, setTotal ] = useState<number>(0)

    const [ isLoadingOrders, setIsLoadingOrders ] = useState<boolean>(true)

    const today = new Date()
    let hour = today.getHours()

    let timeOfDay = (hour < 12) ? 'Morning' : (hour < 17 ) ? 'Afternoon' : 'Evening'

    const supabase = clientSupabase
    const posthog = usePostHog()
    
    function getTableNum(table: string, setStateAction: Dispatch<SetStateAction<number>>){
        supabase
            .from(table)
            .select('*',
            {
                head: true,
                count: 'exact',
            })
            .eq('shop_id', shop.id)
            .then(({count,error}) =>{
                if(error){
                    //console.log(shop)
                    console.log('Error: ', error)
                } else {
                    setStateAction(count!)
                }
            })
    }

    useEffect(() =>{
        posthog.startSessionRecording()
        if (products.length === 0){ getTableNum('products', setProductsNum)}
        //getTableNum('orders', setOrdersNum)

        if (orders.length === 0){
            // Orders could also be zero because they have none... Just saying
            setIsLoadingOrders(true)
            
            getOrdersWithProductsAndShopperDetails
            .eq('shop_id', shop.id)
            .then(({data, error}) =>{
                if(error){
                    console.log(error)
                    popupText(`SB${error.code}: An error occured when fetching the orders`, POPUP_STATE.FAILED)
                } else {
                    //console.log(data)
                    dispatch(setOrders(data.sort(sortByDateUpdated)))
                    //console.log(data.length)
                    setOrdersNum(data.filter((order)=>order.isActive).length ?? 0)
                    let newTotal = 0
                    for (let i = 0 ; i < data.length; i++){
                        let order = data[i]
                        if(order.status == 'FULFILLED' || order.status == 'CLOSED'){
                            for (let j = 0; j < order.order_products.length; j++){
                                newTotal += order.order_products[j].price * order.order_products[j].quantity
                            }
                        }
                    }
                    setTotal(newTotal)
                }
                setIsLoadingOrders(false)
                //console.log(ordersNum)
            })
        }

    }, [user])

    return (
        <>
            <h1 className="font-bold text-lg md:text-2xl mb-4 md:mb-8">Good {timeOfDay}, {user.firstName}</h1>
            <section>
                <h3 className="text-gray-500 mb-4">METRICS</h3>
                <div className="flex flex-col md:flex-row gap-4 md:gap-16 mb-8">
                    <div className="bg-red w-full md:w-1/4 text-white p-4 md:p-8 rounded-xl" >
                        <small className="text-md md:text-lg" >Shop Balance</small>
                        <span className="flex mt-1 md:mt-2 mb-2 items-baseline" >
                            <h4 className="font-bold mr-2">GHS</h4>
                            <h1 className="font-bold text-4xl">{ 5683 ??styledCedis(totalRevenue).slice(0, -3)}</h1>
                            <h4 className="font-bold">.{'00' ?? styledCedis(totalRevenue).slice(-2)}</h4>
                        </span>
                        <small className=" font-normal" >{/*this month*/}as of now</small>
                    </div>
                    <span className="w-full md:w-[calc(50%+4rem)] flex gap-4 md:gap-16">
                        <div className="bg-peach w-1/2 text-darkRed p-4 md:p-8 rounded-xl" >
                            <small className="text-md md:text-lg" >Active Orders</small>
                            <span className="flex gap-2 mt-1 md:mt-2 mb-2 items-baseline" >
                                <h1 className="font-bold text-4xl" >{24 ??ordersNum}</h1>
                                <h4 className="font-bold hidden md:block">order(s)</h4>
                            </span>
                            <small className=" font-normal" >{/*this month*/}at the moment</small>
                        </div>

                        <div className="bg-darkRed w-1/2 text-white p-4 md:p-8 rounded-xl" >
                            <small  className="text-md md:text-lg"  >Total Products</small>
                            <span className="flex gap-2 mt-1 md:mt-2 mb-2 items-baseline" >
                                <h1 className="font-bold text-4xl" >{42??productsNum}</h1>
                                <h4 className="font-bold hidden md:block">product(s)</h4>
                            </span>
                            <small className=" font-normal" >listed publicly</small>
                        </div>
                    </span>
                </div>
                <div className="w-full md:w-[calc(75%+8rem)]">
                    <h3 className="text-gray-500 mb-4">ACTIVE ORDERS</h3>
                    <div className="w-full border-2 border-peach rounded-xl">
                        <div className="bg-peach grid grid-cols-activeOrdersMob md:grid-cols-activeOrders gap-2 md:gap-4 p-2 md:p-4">
                            <p className="hidden md:flex justify-center">No.</p>
                            <p className="text-sm">Order Items</p>
                            <p className="hidden md:flex justify-center">Amount</p>
                            <p className="flex text-sm justify-center">Details</p>
                        </div>
                        <div className="max-h-[270px] overflow-auto">
                            { 
                                isLoadingOrders && 
                                    <>
                                        <p className="text-gray-400 animate-pulse text-center py-4">Loading orders...</p>
                                    </>
                            }

                            { 
                                !isLoadingOrders && ordersNum == 0 &&
                                    <>
                                        <p className="text-gray-400 text-center py-4">You have no orders</p>
                                    </>
                            } 

                            { 
                                !isLoadingOrders && ordersNum != 0 && orders.filter((order)=>order.isActive).map((order, idx) =>{

                                    let total = 0
                                    for(let i = 0; i < order.order_products.length; i++){
                                        total += order.order_products[i].price * order.order_products[i].quantity 
                                    }
                                    
                                    return (
                                        <div className="border-b-peach border-b-2 last:border-b-transparent items-start md:items-center grid grid-cols-activeOrdersMob md:grid-cols-activeOrders gap-2 p-2 md:p-4" key={idx}>
                                            <p className="hidden md:flex justify-center"># {order.id}</p>
                                            {/* @ts-ignore */}
                                            <p className="font-medium md:font-semibold">{order.shopper.firstName + ' ' + order.shopper.lastName + ' - ' + order.shopper.phoneNumber}
                                                <br />
                                                <span className="font-medium text-gray-500">{order.order_products.length } Products</span>
                                                <span className="md:hidden text-red font-bold"> - GHS{styledCedis(total)}</span></p>
                                            <p className="hidden md:flex justify-center">GHS{styledCedis(total)}</p>
                                            <Link href={`/s/dashboard?tab=orders&section=order&id=${order.id}`} className="flex items-center h-full md:h-fit md:items-start justify-center md:block"><button>View<span className="hidden md:inline"> Details</span></button></Link>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}