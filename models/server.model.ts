import { Tables } from "@/types/supabase"


export type serverError = {
    code: string,
    message: string
}

export type IUserOrder = Omit<Tables<'orders'>,' location'> & {
    order_products: Tables<'order_products'> & {
        price: any
        quantity: any
        product: Pick<Tables<'products'>, 'name' | 'imageURL' | 'price' |'id'> & {
            shop_id: Pick<Tables<'shops'>,'shopNameTag'>
        }
    }[],
    location: Tables<'locations'>
}