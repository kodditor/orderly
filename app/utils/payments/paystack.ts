"use server"
import {Paystack} from 'paystack-sdk';
const paystack = new Paystack(process.env.PAYSTACK_API_KEY!);

export async function getPaystack(){
    return paystack
}