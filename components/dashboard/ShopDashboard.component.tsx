"use client"
import { IUserMetadataWithIDAndEmail } from "@/models/user.model";
import { getOrderlyReducer, setShop, setUser } from "@/constants/orderly.slice"
import { Provider } from 'react-redux'
import { IShop } from "@/models/shop.model";
import DashboardComponent from "./Dashboard.component";
import { configureStore } from "@reduxjs/toolkit";

export default function ShopDashboardModule({orderlyUser, orderlyShop}: {orderlyUser: IUserMetadataWithIDAndEmail, orderlyShop: IShop}){
    const orderlyStore = configureStore({
        reducer: {
          shopAndUser: getOrderlyReducer(orderlyShop, orderlyUser)
        },
      })

    return (
        <>
            <Provider store={orderlyStore} >
               <DashboardComponent />
            </Provider>
        </>
    )
}