import { serverSupabase } from "@/app//supabase/supabase-server"
import { getShopDetails } from "@/app/utils/db/supabase-server-queries"
import DashboardLoadSkeleton from "@/components/dashboard/DashboardLoadSkeleton.component"
import ShopDashboardModule from "@/components/dashboard/ShopDashboard.component"
import { redirect } from "next/navigation"

export default async function ShopDashboard(){

    const supabase = serverSupabase

    const { data: { session }} = await supabase.auth.getSession()

    if (session){

        const user = session.user

        //console.log(user)
        if(user.user_metadata.user_metadata){

            let { data, error } = await getShopDetails('user_id', user.id)
            //console.log(data)
            let shopData = data
            if(error){
                return (
                    <>
                        <div className="w-full h-full flex gap-4 justify-center items-center">
                            <p className="font-bold text-2xl">An error occurred when loading your shop. Please try again later</p>
                            <p className="text-red text-lg">SB{error.code}</p>
                        </div>
                    </>
                )
            } else {
            
                if (data!.length != 0){            

                    //console.log(user.user_metadata)

                    let { data, error } = await serverSupabase
                                        .from('user_metadata')
                                        .select(`
                                            firstName,
                                            lastName,
                                            isOrderly,
                                            phoneNumber,
                                            shop_id,
                                            location(*)
                                        `)
                                        .eq('id', user.user_metadata.user_metadata)

                    if(data![0].isOrderly == false){
                        redirect(`${process.env.NEXT_PUBLIC_BASE_URL}`)
                    }

                    let orderlyUser = {
                        id: user.id,
                        email: user.email,
                        ...data![0]
                    }

                    //console.log(orderlyUser)

                    return (
                        <>
                            <div>
                                {/*@ts-ignore*/}
                                <ShopDashboardModule orderlyUser={orderlyUser} orderlyShop={shopData[0]} />
                            </div>
                        </>
                    )
                } else {
                    return (
                        <DashboardLoadSkeleton />
                    )
                }
            }
            
            
        } else {
            redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/s/onboarding?to=s/dashboard`)
        }

    } else {
        redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?to=s/dashboard`)
    }
}