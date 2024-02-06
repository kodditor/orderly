
import { serverSupabase } from "@/app/supabase/supabase-server"
import { IShop } from "@/models/shop.model"
import { QueryData } from "@supabase/supabase-js"

export function getShopDetails(shopNameTag: string){ 
    
    return serverSupabase
            .from('shops')
            .select(`
                *,
                location (
                    buildingNum,
                    streetAddress,
                    city,
                    region,
                    country
                )
            `)
            .eq('shopNameTag', shopNameTag)
            .returns<IShop>()
}
export type shopDetailsType = QueryData<typeof getShopDetails>