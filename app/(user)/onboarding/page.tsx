import { serverSupabase } from "@/app/supabase/supabase-server";
import UserOnboardingComponent from "@/components/user/onboarding/UserOnboarding.component";
import { redirect } from "next/navigation";


export default async function UserOnboarding(){

    const {data: { user }, error} = await serverSupabase.auth.getUser()

    if(error || !user ){
        redirect('/auth/signup?to=/onboarding')
    }

    return (
        <UserOnboardingComponent user={user} />
    )
}