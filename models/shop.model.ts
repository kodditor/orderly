import { shopDetailsType } from "@/app/utils/db/supabase-server-queries";
import { Tables } from "@/types/supabase";


//@ts-ignore
export interface IShop extends Tables<'shops'> {
    location: Tables<'locations'>
}