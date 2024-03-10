import { serverSupabase } from "@/app/supabase/supabase-server";
import { getUser } from "@/app/utils/backend/utils";
import Header from "@/components/Header.component";
import OnboardingComponent from "@/components/Onboarding.component";
import { redirect } from "next/navigation";


export default async function Onboarding(){
    const { user } = await getUser()

    if(user){
        return (
            <>
                <Header signedInUser={user} />
                <OnboardingComponent user={user} />
            </>
        )
    }
    
    redirect( process.env.NEXT_PUBLIC_BASE_URL + '/auth/login?to=s/onboarding')
}