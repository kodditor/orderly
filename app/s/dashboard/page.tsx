import { serverSupabase } from "@/app//supabase/supabase-server"
import { getShopDetails } from "@/app/utils/db/supabase-server-queries"
import Footer from "@/components/Footer.component"
import Header from "@/components/Header.component"
import DashboardLoadSkeleton from "@/components/dashboard/DashboardLoadSkeleton.component"
import ShopDashboardModule from "@/components/dashboard/ShopDashboard.component"
import { IUserMetadata, IUserMetadataWithIDAndEmail, signedInUser } from "@/models/user.model"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function ShopDashboard(){

    const supabase = serverSupabase

    const { data: { session }} = await supabase.auth.getSession()

    if(!session){
        redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?to=s/dashboard`)
    }

    const user = session.user

    if(!user.user_metadata.user_metadata)
    {
        redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/s/onboarding?to=s/dashboard`)
    }

    let userQuery = await serverSupabase
                        .from('user_metadata')
                        .select(`
                            firstName,
                            lastName,
                            phoneNumber,
                            shop_id,
                            location(*)
                        `)
                        .eq('id', user.user_metadata.user_metadata)
                        .returns<IUserMetadata[]>()

    if(userQuery.error != null || userQuery.data == null){
        return (
            <>
                <Header signedInUser={null} />
                <main className="w-screen h-[calc(100vh-50px-173px)] md:h-[calc(100vh-70px-66px)] grid place-items-center">
                    <div className="flex flex-col gap-4 items-center justify-center">
                        <h1 className="font-extrabold text-6xl">500</h1>
                        <p className="font-medium text-lg">Oh No! We couldn't get your details.</p>
                        <p>Code: SB{userQuery.error.code}</p>
                        <Link href={`/`}>
                            <button>Back to Home</button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        )
    }
    
    if(userQuery.data[0].shop_id == undefined || userQuery.data[0].shop_id == null){
        redirect(`${process.env.NEXT_PUBLIC_BASE_URL}`)
    }

    let orderlyUser:IUserMetadataWithIDAndEmail = {
        id: user.id,
        email: user.email!,
        ...userQuery.data![0]
    }

    let shopDataQuery = await getShopDetails('id', orderlyUser.shop_id)
    //console.log(data)
    if(shopDataQuery.error != null || shopDataQuery.data == null || shopDataQuery.data.length == 0){
        return (
            <>
                <Header signedInUser={null} />
                <main className="w-screen h-[calc(100vh-50px-173px)] md:h-[calc(100vh-70px-66px)] grid place-items-center">
                    <div className="flex flex-col gap-4 items-center justify-center">
                        <h1 className="font-extrabold text-6xl">403</h1>
                        <p className="font-medium text-lg">Oh No! You're not authorized to be here.</p>
                        <p>Code: SB{shopDataQuery.error?.code ?? '404'}</p>
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
        <>
            <div>
                <ShopDashboardModule orderlyUser={orderlyUser} orderlyShop={shopDataQuery.data[0]} />
            </div>
        </>
    )
    
    
        
    

}