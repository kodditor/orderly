import { NextRequest, NextResponse } from "next/server";



export async function POST(req: NextRequest){

    const { number } = await req.json()

    const res = await fetch('https://sms.arkesel.com/api/otp/generate',
    {
        method: 'POST',
        headers: {
            'api-key': process.env.ARKESEL_API_KEY!,
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            expiry: 5,
            length: 6,
            medium: 'sms',
            number: number,
            message: "Ready to get orderly?\nHere's your Orderly OTP code: %otp_code%\n\nIt's a secret! Do not share this with anyone.",
            sender_id: 'Orderly GH',
            type: 'numeric',
        })
    })

    const data = await res.json()

    return NextResponse.json(data)

}