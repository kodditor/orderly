'use client'
import { orderlyStore } from "@/constants/orderly.store";
import { IShop } from "@/models/shop.model";
import { Provider } from "react-redux";
import Shop from "./Shop.component";


export default function ShopModule({selectedShop}: {selectedShop: IShop}){


    return(
        <>
            <Provider store={orderlyStore} >
                <Shop selectedShop={selectedShop} />
            </Provider>
        </>
    )
}