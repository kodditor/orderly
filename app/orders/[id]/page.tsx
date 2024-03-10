"use server"
import { serverSupabase } from "@/app/supabase/supabase-server"
import Footer from "@/components/Footer.component"
import Header from "@/components/Header.component"
import Link from "next/link"
import { redirect } from "next/navigation"
import {  IOrderDetails } from "@/models/OrderProducts.model"
import OrderDetailsComponent from "@/components/OrderDetails"
import { getUser } from "@/app/utils/backend/utils"
import * as Sentry from "@sentry/nextjs";


export default async function OrderDetailPage({ params }: { params: { id: string } }){

    const orderID = params.id
    const {user, error } = await getUser()

    if (error != null || !user){
        if(error){
            Sentry.captureException(new Error(`SB${error.code}: ${error.message}`))
            redirect('/')
        }
        return (
            <>
                <Header signedInUser={null} />
                <main className="w-screen h-[calc(100vh-50px-173px)] md:h-[calc(100vh-70px-66px)] grid place-items-center">
                    <div className="flex flex-col gap-4 items-center justify-center">
                        <p className="font-medium text-lg">Please sign in to continue</p>
                        <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?to=/orders/${orderID}`}>
                            <button>Sign In</button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        )
    }

    const orderQuery = await serverSupabase
                                .from('orders')
                                .select(`
                                    status,
                                    id,
                                    isActive,
                                    location(*),
                                    shop_id(*),
                                    shopper(*),
                                    order_products(
                                        *,
                                        product(*)
                                        )
                                `)
                                .eq('id', orderID)
                                .eq('shopper', user.id)
                                .returns<IOrderDetails[]>()
    
    if(orderQuery.error != null){

        Sentry.captureException(new Error(`SB${orderQuery.error.code}: ${orderQuery.error.message}`))

        return (
            <>
                <Header signedInUser={user} />
                <main className="w-screen h-[calc(100vh-50px-173px)] md:h-[calc(100vh-70px-66px)] grid place-items-center">
                    <div className="flex flex-col gap-4 items-center justify-center">
                        <h1 className="font-extrabold text-6xl">500</h1>
                        <p className="font-medium text-lg">Oh No! We couldn't get your order details.</p>
                        <p>Code: SB{orderQuery.error.code}</p>
                        <Link href={`/`}>
                            <button>Back to Home</button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        )
        
    }

    if(orderQuery.data.length == 0){
    
        return (
            <>
                <Header signedInUser={user} />
                <main className="w-screen h-[calc(100vh-50px-173px)] md:h-[calc(100vh-70px-66px)] grid place-items-center">
                    <div className="flex flex-col gap-4 items-center justify-center">
                        <h1 className="font-extrabold text-6xl">403</h1>
                        <p className="font-medium text-lg">You are not authorized to view {orderID}.</p>
                        <Link href={`/`}>
                            <button>Back to Home</button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        )
        
    }

    return (
        <OrderDetailsComponent signedInUser={user} order={orderQuery.data[0]} />
    )

}
