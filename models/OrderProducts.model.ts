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

export interface IOrderDetails {
    id: number,
    status: Database["public"]["Enums"]["order_status"],
    isActive: boolean,
    location: Tables<'locations'>,
    shop_id: Tables<'shops'>,
    shopper: Tables<'user_metadata'>,
    order_products:  {
        price: number,
        quantity: number,
        product: Tables<'products'>,
    }[]
}