import { NextRequest, NextResponse } from "next/server";
import { ContactsApi, ContactsApiApiKeys } from "@getbrevo/brevo"
import { CreateContact } from "@getbrevo/brevo/dist/model/createContact";
import { brevoApiResponse } from "@/models/notification.model";
const contactAPI = new ContactsApi();

contactAPI.setApiKey(ContactsApiApiKeys.apiKey, process.env.BREVO_API_KEY!)

export async function POST(request: NextRequest){
    
    let response: brevoApiResponse

    const params = request.json() as CreateContact

    console.log(params)

    const brevoResponse = await contactAPI.createContact(params)

    if(brevoResponse.body.id){
        response = {
            data: {
                status: '200',
                msg: 'Brevo contact created successfully'
            },
            error: null
        }
    } else {
        response = {
            data: null,
            error: {
                code: '500',
                msg: 'An error occurred when creating a contact'
            }
        }
    }
    return NextResponse.json(JSON.stringify(response))
}