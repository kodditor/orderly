"use server"
import { serverSupabase } from "@/app/supabase/supabase-server"
import Footer from "@/components/Footer.component"
import Header from "@/components/Header.component"
import Link from "next/link"
import { redirect } from "next/navigation"
import { signedInUser } from "@/models/user.model"
import {  IOrderDetails } from "@/models/OrderProducts.model"
import OrderDetailsComponent from "@/components/OrderDetails"

export default async function OrderDetailPage({ params }: { params: { id: string } }){

    const orderID = params.id
    const supabase = serverSupabase

    const { data: { session }} = await supabase.auth.getSession()

    if (!session?.user.user_metadata.user_metadata){
        return (
            <>
                <Header />
                <main className="w-screen h-[calc(100vh-50px-173px)] md:h-[calc(100vh-70px-66px)] grid place-items-center">
                    <div className="flex flex-col gap-4 items-center justify-center">
                        <p className="font-medium text-lg">Please sign in to continue</p>
                        <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?to=/order/${orderID}`}>
                            <button>Sign In</button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        )
    }

    let { data, error } = await serverSupabase
                                        .from('user_metadata')
                                        .select(`
                                            firstName,
                                            lastName,
                                            isOrderly,
                                            phoneNumber,
                                            shop_id
                                        `)
                                        .eq('id', session.user.user_metadata.user_metadata)

    if( !data || data?.length == 0){
        console.log(error)
        redirect('/')
    }

    //@ts-ignore
    const signedInUser: signedInUser = {
        id: session.user.id,
        email: session.user.email!,
        ...data[0]
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
                                .returns<IOrderDetails[]>()

    //console.log(orderQuery.data)
    
    if(orderQuery.error != null){
        return (
            <>
                <Header />
                <main className="w-screen h-[calc(100vh-50px-173px)] md:h-[calc(100vh-70px-66px)] grid place-items-center">
                    <div className="flex flex-col gap-4 items-center justify-center">
                        <h1 className="font-extrabold text-6xl">500</h1>
                        <p className="font-medium text-lg">Oh No! We couldn't get your order details.</p>
                        <p>Code: SB{orderQuery?.error.code}</p>
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
                <Header />
                <main className="w-screen h-[calc(100vh-50px-173px)] md:h-[calc(100vh-70px-66px)] grid place-items-center">
                    <div className="flex flex-col gap-4 items-center justify-center">
                        <h1 className="font-extrabold text-6xl">404</h1>
                        <p className="font-medium text-lg">Order #{orderID} does not exist.</p>
                        <Link href={`/`}>
                            <button>Back to Home</button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        )
        
    }

    if(`${orderQuery.data[0].shopper.id}` != signedInUser.id ){
        return (
            <>
                <Header />
                <main className="w-screen h-[calc(100vh-50px-173px)] md:h-[calc(100vh-70px-66px)] grid place-items-center">
                    <div className="flex flex-col items-center justify-center">
                        <h1 className="font-extrabold mb-4 text-6xl">403</h1>
                        <p className="font-medium mb-1 text-lg">You are not authorized to view this order</p>
                        <p className="text-sm mb-4">Kindly refresh if you're coming from the login page.</p>
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
        <OrderDetailsComponent order={orderQuery.data[0]} />
    )

}
