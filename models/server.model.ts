import { Tables } from "@/types/supabase"


export type serverError = {
    code: string,
    message: string
}

export type IUserOrder = Omit<Tables<'orders'>, 'order_products' | 'price' | 'location'> & {
    order_products: Pick<Tables<'order_products'>, 'price' | 'quantity'> & {
        product: Pick<Tables<'products'>, 'name' | 'imageURL'>
    },
    location: Tables<'locations'>
}