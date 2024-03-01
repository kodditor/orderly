import Header from "@/components/Header.component";
import UpdatePasswordComponent from "@/components/auth/UpdatePassword.component";


export default function UpdatePassword(){
    return(
        <>
            <Header signedInUser={null}/>
            <UpdatePasswordComponent />
        </>
    )
}