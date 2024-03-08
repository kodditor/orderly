import { serverSupabase } from "@/app/supabase/supabase-server";
import { getUser } from "@/app/utils/backend/utils";
import Header from "@/components/Header.component";
import OnboardingComponent from "@/components/Onboarding.component";
import { redirect } from "next/navigation";


export default async function Onboarding(){

    const supabase = serverSupabase

    const { data: { session }} = await supabase.auth.getSession()
    const { user } = await getUser()

    if(session){
        return (
            <>
                <Header signedInUser={user} />
                <OnboardingComponent user={session.user} />
            </>
        )
    }
    
    redirect( process.env.NEXT_PUBLIC_BASE_URL + '/auth/login?to=s/onboarding')
}