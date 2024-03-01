import { serverSupabase } from "@/app/supabase/supabase-server";
import { TablesInsert } from "@/types/supabase";
import { NextRequest, NextResponse } from "next/server";



export async function POST(req: NextRequest){

    const insertObject = await req.json() as TablesInsert<'user_metadata'>

    const dbReq = await serverSupabase
                .from('user_metadata')
                .insert(insertObject)
                .select('id')
    const { data, error } = dbReq
    return NextResponse.json({data, error})
}

export async function PATCH(req: NextRequest){
    const body = await req.json() as TablesInsert<'user_metadata'>

    const { id, ...updateObject } = body

    const dbReq = await serverSupabase
                        .from('user_metadata')
                        .update(updateObject)
                        .eq('id', id!)
    
    const { error } = dbReq

    return NextResponse.json({error})        
}