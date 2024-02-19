import { Database, Enums, Tables } from "@/types/supabase"
import { IShopperDetails } from "./orderShopper.model"

export interface IOrderProducts {
    product_id: string,
    price: number,
    quantity: number
}

export interface IShopCart {
    id: string,
    shopper: IShopperDetails
    products: IOrderProducts[],
}

export interface IOrderResponse {
    id: number,
    created_at: string,
    updated_at: string,
    status: Database["public"]["Enums"]["order_status"],
    shopper: Tables<'user_metadata'>,
    products: Tables<'order_products'>[],
    location: Tables<'locations'>
}