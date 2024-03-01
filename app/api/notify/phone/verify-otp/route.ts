import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest){

    const { number, otp } = await req.json()

    const res = await fetch('https://sms.arkesel.com/api/otp/verify',{
        headers: {
            'api-key': process.env.ARKESEL_API_KEY!,
            'content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            code: otp,
            number: number
        })
    })

    const data = await res.json()

    return NextResponse.json(data)

}