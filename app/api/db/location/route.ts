import { serverSupabase } from "@/app/supabase/supabase-server";
import { TablesInsert } from "@/types/supabase";
import { NextRequest, NextResponse } from "next/server";



export async function POST(req: NextRequest){

    const insertObject = await req.json() as TablesInsert<'locations'>

    const dbReq = await serverSupabase
                .from('locations')
                .insert(insertObject)
                .select('id')
    const { data, error } = dbReq

    return NextResponse.json({data, error})

}