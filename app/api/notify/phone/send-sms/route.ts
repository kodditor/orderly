import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest){

    const {number, message} = await req.json()

    const data = {
        "sender": "Orderly GH",
        "message": `${message}`,
        "recipients": [number],
        //"sandbox": true
    }

    const res = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
        method: 'post',
        headers: {
            'api-key': process.env.ARKESEL_API_KEY!,
            'content-type': 'application/json',
        },
        body: JSON.stringify(data)
    })

    let resData = await res.json()
    return NextResponse.json(resData)
}