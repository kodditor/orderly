import { serverSupabase } from "@/app/supabase/supabase-server";
import { serverError } from "@/models/server.model";
import { signedInUser } from "@/models/user.model";
import { PostgrestError } from "@supabase/supabase-js";


type GetUserType = {
    user: signedInUser | null,
    error: PostgrestError | serverError | null
}

export async function getUser(user_id?: string):Promise<GetUserType> {

    if(typeof user_id == undefined || !user_id){

        const { data: { session }} = await serverSupabase.auth.getSession()

        if (!session){
            return {
                user: null,
                error: {
                    code: '401',
                    message: 'Session invalid'
                }
            }
        }

        const userQuery = await serverSupabase
                                        .from('user_metadata')
                                        .select(`
                                            id,
                                            email,
                                            firstName,
                                            lastName,
                                            isOrderly,
                                            phoneNumber,
                                            shop_id,
                                            location(*)
                                        `)
                                        .eq('id', session.user.user_metadata.user_metadata)
                                        .returns<signedInUser>()
                                        .single()

         return { user: userQuery.data , error: userQuery.error}
    }
    const userQuery = await serverSupabase
                                        .from('user_metadata')
                                        .select(`
                                            id,
                                            email,
                                            firstName,
                                            lastName,
                                            isOrderly,
                                            phoneNumber,
                                            shop_id,
                                            location(*)
                                        `)
                                        .eq('id', user_id)
                                        .returns<signedInUser>()
                                        .single()

    return { user: userQuery.data , error: userQuery.error}

}