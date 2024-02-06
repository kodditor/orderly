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

            let {data, error } = await getShopDetails('user_id', user.id)
            
            if (data){
                
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
                            <ShopDashboardModule orderlyUser={orderlyUser} orderlyShop={data} />
                        </div>
                    </>
                )
            } else {
                return (
                    <DashboardLoadSkeleton />
                )
            }
            
            
        } else {
            redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/s/onboarding?to=s/dashboard`)
        }

    } else {
        redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?to=s/dashboard`)
    }
}