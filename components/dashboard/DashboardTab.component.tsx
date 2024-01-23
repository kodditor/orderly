"use client"
import { clientSupabase } from "@/app/supabase/supabase-client"
import type { RootState } from "@/constants/orderly.store"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSelector } from 'react-redux'
import { Dispatch, SetStateAction } from "react"



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
                    console.log(data)
                    if (data.length === 0){}
                    else if (data.length === 1){ setTotal(data[1].total!)}
                    else {
                        let tempTotal = 0
                        data.forEach((a)=>{
                            tempTotal += a.total!
                        })
                        console.log(tempTotal)
                        setTotal(tempTotal)
                    }
                } else (
                    console.log('Error: ', error)
                )
            })
        }

    }, [user])

    return (
        <>
            <h1 className="font-bold text-2xl mb-8">Good {timeOfDay}, {user.firstName}</h1>
            <section>
                <h3 className="text-gray-500 mb-4">METRICS</h3>
                <div className="flex md:flex-row gap-16 mb-8">
                    <div className="bg-red w-1/4 text-white p-8 rounded-xl" >
                        <small className="text-lg" >Total Revenue</small>
                        <span className="flex mt-2 mb-2 items-baseline" >
                            <h4 className="font-bold mr-2">GHS</h4>
                            <h1 className="font-bold text-4xl">{totalRevenue.toFixed(0).toLocaleLowerCase()}</h1>
                            <h4 className="font-bold">.{totalRevenue.toFixed(2).slice(-2)}</h4>
                        </span>
                        <small className=" font-light" >this month</small>
                    </div>

                    <div className="bg-peach w-1/4 text-darkRed p-8 rounded-xl" >
                        <small className="text-lg" >Active Orders</small>
                        <span className="flex gap-2 mt-2 mb-2 items-baseline" >
                            <h1 className="font-bold text-4xl" >{ordersNum}</h1>
                            <h4 className="font-bold">orders</h4>
                        </span>
                        <small className=" font-light" >this month</small>
                    </div>

                    <div className="bg-darkRed w-1/4 text-white p-8 rounded-xl" >
                        <small  className="text-lg"  >Total Products</small>
                        <span className="flex gap-2 mt-2 mb-2 items-baseline" >
                            <h1 className="font-bold text-4xl" >{productsNum}</h1>
                            <h4 className="font-bold">products</h4>
                        </span>
                        <small className=" font-light" >in inventory</small>
                    </div>
                </div>
                <div className="w-[calc(75%+8rem)]">
                    <h3 className="text-gray-500 mb-4">ACTIVE ORDERS</h3>
                    <div className="border-2 border-peach rounded-xl">
                        <div className="bg-peach grid grid-cols-activeOrders gap-4 p-4">
                            <p className="flex justify-center">Order #</p>
                            <p>Order Items</p>
                            <p className="flex justify-center">Amount</p>
                            <p className="flex justify-center">Details</p>
                        </div>
                        <div className="max-h-[270px] overflow-auto">
                            { orderTempObjects.map((order, idx) =>{
                                return (
                                    <div className="border-b-peach last:border-b-transparent items-center grid grid-cols-activeOrders gap-4 p-4" key={idx}>
                                        <p className="flex justify-center"># {order.id}</p>
                                        <p>{order.products}</p>
                                        <p className="font-black flex justify-center">GHS{order.amount.toFixed(2)}</p>
                                        <Link href={''}><button>View Details</button></Link>
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