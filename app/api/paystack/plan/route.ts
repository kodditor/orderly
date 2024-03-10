import { getPaystack } from "@/app/utils/payments/paystack";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest){

    const paystack = await getPaystack();
    const data = await paystack.plan.list()

    return NextResponse.json(data)

}