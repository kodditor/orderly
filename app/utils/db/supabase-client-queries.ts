import { clientSupabase } from "@/app/supabase/supabase-client"
import { QueryData } from "@supabase/supabase-js"

export const getOrdersWithProductsAndShopperDetails = clientSupabase
                .from('orders')
                .select(`
                    *, 
                    shopper(*),
                    location(*), 
                    order_products(*)
                `)
    

export const getAllProducts = clientSupabase
                            .from('products')
                            .select('*')

export type ordersType = QueryData<typeof getOrdersWithProductsAndShopperDetails>


export const accessOrders = clientSupabase
                            .from('orders')