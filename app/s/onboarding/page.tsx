import { serverSupabase } from "@/app/supabase/supabase-server";
import Header from "@/components/Header.component";
import OnboardingComponent from "@/components/Onboarding.component";
import { redirect } from "next/navigation";


export default async function Onboarding(){

    const supabase = serverSupabase

    const { data: { session }} = await supabase.auth.getSession()

    if(session){
        return (
            <>
                <Header />
                <OnboardingComponent user={session.user} />
            </>
        )
    } else {
        redirect( process.env.NEXT_PUBLIC_BASE_URL + '/auth/login?to=s/onboarding')
    }
}