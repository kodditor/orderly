import Header from "@/app/components/Header.component"
import ShopLoginComponent from "@/app/components/shopLogin.component"
import { supabase } from "@/app/supabase"


export default async function ShopDashboardModule(){
    const user = await supabase.auth.getUser()

    if (user.data.user){
        console.log(user)
    return (
        <>
            {user.data.user!.email}
            hello world
        </>
    )} else {
        return (
            <>
                <Header />
                <div className="mt-16">
                    <ShopLoginComponent />
                </div>
            </>
        )
    }
}