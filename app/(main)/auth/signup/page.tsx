import Header from "@/components/Header.component";
import SignUpComponent from "@/components/auth/SignUp.component";


export default function SignUp(){
    
    return(
        <>
            <Header signedInUser={null} />
            <SignUpComponent />
        </>
    )
}