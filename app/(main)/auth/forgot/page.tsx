import Header from "@/components/Header.component";
import ForgotPasswordComponent from "@/components/auth/ForgotPassword.component";


export default function Login(){
    return(
        <>
            <Header signedInUser={null} />
            <ForgotPasswordComponent />
        </>
    )
}