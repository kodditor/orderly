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

        if(user.user_metadata.firstName){

            let { data, error } = await getShopDetails('user_id', user.id)
            
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
                    
                    let orderlyUser = {
                        id: user.id,
                        email: user.email,
                        ...user.user_metadata
                    }

                    //console.log(data)

                    return (
                        <>
                            <div>
                                {/*@ts-ignore*/}
                                <ShopDashboardModule orderlyUser={orderlyUser} orderlyShop={data[0]} />
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