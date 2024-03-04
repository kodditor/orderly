import { serverSupabase } from "@/app//supabase/supabase-server"
import { getShopDetails } from "@/app/utils/db/supabase-server-queries"
import DashboardLoadSkeleton from "@/components/dashboard/DashboardLoadSkeleton.component"
import ShopDashboardModule from "@/components/dashboard/ShopDashboard.component"
import { IUserMetadata, IUserMetadataWithIDAndEmail, signedInUser } from "@/models/user.model"
import { redirect } from "next/navigation"

export default async function ShopDashboard(){

    const supabase = serverSupabase

    const { data: { session }} = await supabase.auth.getSession()

    if(!session){
        redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?to=s/dashboard`)
    }

    const user = session.user
    //console.log(user)

    if(!user.user_metadata.user_metadata)
    {
        redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/s/onboarding?to=s/dashboard`)
    }

    let userQuery = await serverSupabase
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
                        .returns<IUserMetadata[]>()

    if(userQuery.error != null || userQuery.data == null){
        return (
            <>
                <div className="w-full h-full flex gap-4 justify-center items-center">
                    <p className="font-bold text-2xl">An error occurred when loading your shop. Please try again later</p>
                    <p className="text-red text-lg">SB{userQuery.error?.code}</p>
                </div>
            </>
        )
    }
    
    if(userQuery.data[0].isOrderly == false){
        redirect(`${process.env.NEXT_PUBLIC_BASE_URL}`)
    }

    let orderlyUser:IUserMetadataWithIDAndEmail = {
        id: user.id,
        email: user.email!,
        ...userQuery.data![0]
    }

    let shopDataQuery = await getShopDetails('id', orderlyUser.shop_id)
    //console.log(data)
    if(shopDataQuery.error || shopDataQuery.data == null){
        return (
            <>
                <div className="w-full h-full flex gap-4 justify-center items-center">
                    <p className="font-bold text-2xl">An error occurred when loading your shop. Please try again later</p>
                    <p className="text-red text-lg">SB{shopDataQuery.error.code}</p>
                </div>
            </>
        )
    }

    if(shopDataQuery.data.length == 0){
        return (
            <DashboardLoadSkeleton />
        )
    }       

    //console.log(user.user_metadata)

    //console.log(orderlyUser)

    return (
        <>
            <div>
                <ShopDashboardModule orderlyUser={orderlyUser} orderlyShop={shopDataQuery.data[0]} />
            </div>
        </>
    )
    
    
        
    

}