import { ConfirmEmail } from "@/app/utils/notifications/templates/emails.template";
import { emailConfirmationParameters} from "@/models/notification.model";
import { NextResponse } from "next/server";
import { Resend } from "resend";



const resend = new Resend(process.env.RESEND_API_KEY);

type confirmPostBody ={
    email: string,
    parameters: emailConfirmationParameters
}

export async function POST(req: Request) {

    const { email, parameters } = await req.json() as unknown as confirmPostBody

    console.log(email, parameters)

    const resendResponse= await resend.emails.send({
    from: 'Orderly Ghana <noreply@orderlygh.shop>',
    to: [email],
    subject: `Order #${parameters.order_id} confirmed!`,
    react: ConfirmEmail({parameters}),
    });
    console.log(resendResponse)
    return NextResponse.json({resendResponse})
}