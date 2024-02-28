import { ConfirmEmail } from "@/app/utils/notifications/templates/emails.template";
import { emailConfirmationParameters} from "@/models/notification.model";
import { NextResponse } from "next/server";
import { render } from '@react-email/render';
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

type confirmPostBody ={
    email: string,
    parameters: emailConfirmationParameters
}

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || '',
});

export async function POST(req: Request) {

    const { email, parameters } = await req.json() as unknown as confirmPostBody

    console.log(email, parameters)

    const emailHtml = render(ConfirmEmail({parameters}));

    const sentFrom = new Sender("noreply@orderlygh.shop", "Orderly Ghana");
    const recipients = [
    new Recipient(email, parameters.firstName)
    ];

    const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(`Order #${parameters.order_id} confirmed!`)
    .setHtml(emailHtml)

    const mailSenderResponse = await mailerSend.email.send(emailParams);
    return NextResponse.json(mailSenderResponse)
}