"use client"
import { clientSupabase } from "@/app/supabase/supabase-client"
import type { RootState } from "@/constants/orderly.store"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSelector } from 'react-redux'
import { Dispatch, SetStateAction } from "react"
import { popupText } from "../Popup.component"



export default function DashboardTabComponent (){

    const {shop, user, orders, products} = useSelector((state: RootState) => state.shopAndUser)
    const [ productsNum, setProductsNum ] = useState<number>(0)
    const [ ordersNum, setOrdersNum ] = useState<number>(0)
    const [ totalRevenue, setTotal ] = useState<number>(0)

    const today = new Date()
    let hour = today.getHours()

    let timeOfDay = (hour < 12) ? 'Morning' : (hour < 17 ) ? 'Afternoon' : 'Evening'

    const supabase = clientSupabase

    const orderTempObjects = [
        {
            id: '1',
            products: 'Product 1, Product 4 and 13 others...',
            amount: 275000,
        },
        {
            id: '2',
            products: 'Product 3, Product 2 and 1 other...',
            amount: 200,
        },
        {
            id: '3',
            products: 'Product 6, Product 4 and 2 others...',
            amount: 500,
        },
        {
            id: '4',
            products: 'Product 10, Product 42 and 7 others...',
            amount: 7000,
        },
        {
            id: '5',
            products: 'Product 1 and Product 4',
            amount: 275,
        },
    ]

    
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
                if(!error){
                    setStateAction(count!)
                } else (
                    console.log('Error: ', error)
                )
            })
    }

    useEffect(() =>{

        if (products.length === 0){ getTableNum('products', setProductsNum)}
        getTableNum('orders', setOrdersNum)

        if (orders.length === 0){
            // Orders could also be zero because they have none... Just saying
            supabase
            .from('orders')
            .select('total')
            .eq('shop_id', shop.id)
            .then( ({data,error}) =>{
                if(!error){
                    //console.log(data)
                    if (data.length === 0){}
                    else if (data.length === 1){ setTotal(data[1].total!)}
                    else {
                        let tempTotal = 0
                        data.forEach((a)=>{
                            tempTotal += a.total!
                        })
                        //console.log(tempTotal)
                        setTotal(tempTotal)
                    }
                } else (
                    console.error('Error: ', error)
                )
            })
        }

    }, [user])

    return (
        <>
            <h1 className="font-bold text-2xl mb-4 md:mb-8">Good {timeOfDay}, {user.firstName}</h1>
            <section>
                <h3 className="text-gray-500 mb-4">METRICS</h3>
                <div className="flex flex-col md:flex-row gap-4 md:gap-16 mb-8">
                    <div className="bg-red w-full md:w-1/4 text-white p-4 md:p-8 rounded-xl" >
                        <small className="text-lg" >Total Revenue</small>
                        <span className="flex mt-1 md:mt-2 mb-2 items-baseline" >
                            <h4 className="font-bold mr-2">GHS</h4>
                            <h1 className="font-bold text-4xl">{totalRevenue.toFixed(0).toLocaleLowerCase()}</h1>
                            <h4 className="font-bold">.{totalRevenue.toFixed(2).slice(-2)}</h4>
                        </span>
                        <small className=" font-light" >this month</small>
                    </div>
                    <span className="w-full md:w-[calc(50%+4rem)] flex gap-4 md:gap-16">
                        <div className="bg-peach w-1/2 text-darkRed p-4 md:p-8 rounded-xl" >
                            <small className="text-lg" >Active Orders</small>
                            <span className="flex gap-2 mt-1 md:mt-2 mb-2 items-baseline" >
                                <h1 className="font-bold text-4xl" >{ordersNum}</h1>
                                <h4 className="font-bold hidden md:block">orders</h4>
                            </span>
                            <small className=" font-light" >this month</small>
                        </div>

                        <div className="bg-darkRed w-1/2 text-white p-4 md:p-8 rounded-xl" >
                            <small  className="text-lg"  >Total Products</small>
                            <span className="flex gap-2 mt-1 md:mt-2 mb-2 items-baseline" >
                                <h1 className="font-bold text-4xl" >{productsNum}</h1>
                                <h4 className="font-bold hidden md:block">product(s)</h4>
                            </span>
                            <small className=" font-light" >listed</small>
                        </div>
                    </span>
                </div>
                <div className="w-full md:w-[calc(75%+8rem)]">
                    <h3 className="text-gray-500 mb-4">ACTIVE ORDERS</h3>
                    <div className="w-full border-2 border-peach rounded-xl">
                        <div className="bg-peach grid grid-cols-activeOrdersMob md:grid-cols-activeOrders gap-2 md:gap-4 p-2 md:p-4">
                            <p className="hidden md:flex justify-center"><span className="hidden md:block">Order #</span><span className="block md:hidden">#</span></p>
                            <p>Order Items</p>
                            <p className="hidden md:flex justify-center">Amount</p>
                            <p className="flex justify-center">Details</p>
                        </div>
                        <div className="max-h-[270px] overflow-auto">
                            { orderTempObjects.map((order, idx) =>{
                                return (
                                    <div className="border-b-peach last:border-b-transparent items-start md:items-center grid grid-cols-activeOrdersMob md:grid-cols-activeOrders gap-2 md:gap-4 p-2 md:p-4" key={idx}>
                                        <p className="hidden md:flex justify-center"># {order.id}</p>
                                        <p>{order.products.length} Products
                                        {/*<br /><span>Order Contact name</span>*/}
                                        <br className="md:hidden" /><span className="md:hidden text-red font-bold">GHS{order.amount.toFixed(2)}</span></p>
                                        <p className="font-black hidden md:flex justify-end">GHS{order.amount.toFixed(2)}</p>
                                        <Link href={''} className="flex justify-center md:block"><button>View<span className="hidden md:inline"> Details</span></button></Link>
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