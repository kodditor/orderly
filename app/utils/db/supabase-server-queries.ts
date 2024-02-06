
import { serverSupabase } from "@/app/supabase/supabase-server"
import { QueryData } from "@supabase/supabase-js"

export const getShopDetails = serverSupabase
                            .from('shops')
                            .select(`
                                *,
                                location(*)
                            `)
export type shopDetailsType = QueryData<typeof getShopDetails>[0]