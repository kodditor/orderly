
import { emailConfirmationParameters, notificationResponse } from "@/models/notification.model";


export default async function sendConfirmationEmail(email:string, parameters: emailConfirmationParameters): Promise<notificationResponse> {

    let response: notificationResponse
    // probably sanitize user values

    const req = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email`, {
        method: 'POST',
        body: JSON.stringify({
            email: email,
            parameters: parameters
        })
    })

    const { data, error } = await req.json()
    console.log(data, error)

    if(error){
        response = {
            data: null,
            error: {
                code: '500',
                msg: `${error.name}: ${error.message}`
            }
        }
    } else {
        response = {
            data: {
                status: '200',
                msg: `Email ID: ${data.id}`
            },
            error: null
        }   
    } 
    return response
    
}