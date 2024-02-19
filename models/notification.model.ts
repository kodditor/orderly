import { Tables } from "@/types/supabase"
import { ILocation } from "./orderShopper.model"
import { IOrderProducts } from "./OrderProducts.model"


export type notificationResponse = {
    data: {
        status: string
        msg: string
    } | null
    error: {
        code: string,
        msg: string
    } | null
}


export type emailConfirmationParameters = {
    products: IOrderProducts[], 
    shopName: string,
    firstName: string,
    order_id: string,
    location: ILocation
}

export type brevoApiResponse = {
    data: {
        status: string
        msg: string
    } | null
    error: {
        code: string,
        msg: string
    } | null
}