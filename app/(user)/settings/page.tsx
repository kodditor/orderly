import { getUser } from "@/app/utils/backend/utils";
import Footer from "@/components/Footer.component";
import Header from "@/components/Header.component";
import UserSettingsComponent from "@/components/user/settings/UserSettings.component";
import Link from "next/link";


export default async function UserSettings(){

    const {user, error} = await getUser()

    if(error){

        if(error.code == '401'){
            return (
                <>
                    <Header signedInUser={null} />
                    <main className="w-screen h-[calc(100vh-50px-173px)] md:h-[calc(100vh-70px-66px)] grid place-items-center">
                        <div className="flex flex-col gap-4 items-center justify-center">
                            <p className="font-medium text-lg">Please sign in to continue</p>
                            <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?to=/settings`}>
                                <button>Sign In</button>
                            </Link>
                        </div>
                    </main>
                    <Footer />
                </>
            )
        }

        return (
            <>
                <Header signedInUser={null} />
                <main className="w-screen h-[calc(100vh-50px-173px)] md:h-[calc(100vh-70px-66px)] grid place-items-center">
                    <div className="flex flex-col gap-4 items-center justify-center">
                        <h1 className="font-extrabold text-6xl">500</h1>
                        <p className="font-medium text-lg">Oh No! We couldn't get your details.</p>
                        <p>Code: SB{error.code}</p>
                        <Link href={`/`}>
                            <button>Back to Home</button>
                        </Link>
                    </div>
                </main> 
                <Footer />
            </>
        )
    }

    if(!user){
        return (
            <>
                <Header signedInUser={null} />
                <main className="w-screen h-[calc(100vh-50px-173px)] md:h-[calc(100vh-70px-66px)] grid place-items-center">
                    <div className="flex flex-col gap-4 items-center justify-center">
                        <p className="font-medium text-lg">Please sign in to continue</p>
                        <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?to=/settings`}>
                            <button>Sign In</button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        )
    }
    return (
        <UserSettingsComponent user={user} />
    )

}