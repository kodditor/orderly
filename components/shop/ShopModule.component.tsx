'use client'
import { orderlyStore } from "@/constants/orderly.store";
import { Provider } from "react-redux";
import Shop from "./Shop.component";
import { shopDetailsType } from "@/app/utils/db/supabase-server-queries";
import { IShop } from "@/models/shop.model";
import { signedInUser } from "@/models/user.model";


export default function ShopModule({selectedShop, signedInUser}: {selectedShop: IShop, signedInUser: signedInUser| null}){

    return (
        <>
            <Provider store={orderlyStore} >
                <Shop selectedShop={selectedShop} signedInUser={signedInUser} />
            </Provider>
        </>
    )
}