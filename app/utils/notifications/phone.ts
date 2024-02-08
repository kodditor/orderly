/*

Provide handlers to send notifications to users

*/

import { ordersType } from "../db/supabase-client-queries"

type confirmationResponse = {
    data: {
        status: string
        msg: string
    }
    error: {
        code: string,
        msg: string
    } | null
}

export async function sendConfirmationText(number:string, order_id:string | number, shopName: string): Promise<confirmationResponse> {

    let response: confirmationResponse

    if(number.startsWith('0')){
        number = '233' + number.slice(1)
    }

    const data = {
        "sender": "Orderly GH",
        "message": `Your order (#${order_id}) from ${shopName} has been confirmed!`,
        "recipients": [number],
        //"sandbox": true
    }

    let res = await fetch('https://sms.arkesel.com/api/v2/sms/send',
    {
        method: 'post',
        headers: {
            'api-key': process.env.NEXT_PUBLIC_ARKESEL_API_KEY!,
            'content-type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    let resData = await res.json()
    if(resData.status == 'success'){
        response = {
            data: {
                status: '200',
                msg: 'Message sent successfully'
            },
            error: null
        }
    } else {
        response = { 
            data: {
                status: '200',
                msg: 'Message sent successfully'
            },
            error: {
                code: '402',
                msg: 'An error occurred'
            }
        }
    }
    
    return response

} 

export async function sendDeclinedText(number:string, order_id:string | number, shopName: string): Promise<confirmationResponse> {

    let response: confirmationResponse

    if(number.startsWith('0')){
        number = '233' + number.slice(1)
    }

    const data = {
        "sender": "Orderly GH",
        "message": `Your order (#${order_id}) from ${shopName} has been declined.`,
        "recipients": [number],
        //"sandbox": true
    }

    let res = await fetch('https://sms.arkesel.com/api/v2/sms/send',
    {
        method: 'post',
        headers: {
            'api-key': process.env.NEXT_PUBLIC_ARKESEL_API_KEY!,
            'content-type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    let resData = await res.json()
    if(resData.status == 'success'){
        response = {
            data: {
                status: '200',
                msg: 'Message sent successfully'
            },
            error: null
        }
    } else {
        response = { 
            data: {
                status: '200',
                msg: 'Message sent successfully'
            },
            error: {
                code: '402',
                msg: 'An error occurred'
            }
        }
    }
    
    return response

} 