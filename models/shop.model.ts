import { shopDetailsType } from "@/app/utils/db/supabase-server-queries";
import { Tables } from "@/types/supabase";


//@ts-ignore
export interface IShop extends shopDetailsType {
    location: Tables<'locations'>
}