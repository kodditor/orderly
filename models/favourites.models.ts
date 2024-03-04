import { Tables } from "@/types/supabase";


export type IFavourite = Omit<Tables<'favourites'>, 'product'> & {
    product: Omit<Tables<'products'>, 'shop_id'> & {
        shop_id: {
            'shopNameTag': string
        }
    }
}