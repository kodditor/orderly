import { serverSupabase } from "@/app//supabase/supabase-server"
import ShopDashboardModule from "@/components/dashboard/ShopDashboard.component"
import { redirect } from "next/navigation"


export default async function ShopDashboard(){

    const supabase = serverSupabase

    const { data: { session }} = await supabase.auth.getSession()

    if (session){

        const user = session.user

        if(user.user_metadata.firstName){

            let {data, error } = await supabase
                .from('shops')
                .select('*')
                .eq('userID', user.id)
            
            if (data && data.length != 0){
                
                let orderlyUser = {
                    id: user.id,
                    email: user.email,
                    ...user.user_metadata
                }

                return (
                    <>
                        <div>
                            <ShopDashboardModule orderlyUser={orderlyUser} orderlyShop={data[0]} />
                        </div>
                    </>
                )
            } else {
                return (
                    <>
                        Skeleton
                    </>
                )
            }
            
            
        } else {
            redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/s/onboarding?to=s/dashboard`)
        }

    } else {
        redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?to=s/dashboard`)
    }
}