"use client"
import {  signedInUser } from "@/models/user.model";
import { getOrderlyReducer } from "@/constants/orderly.slice"
import { Provider } from 'react-redux'
import { IShop } from "@/models/shop.model";
import DashboardComponent from "./Dashboard.component";
import { configureStore } from "@reduxjs/toolkit";

export default function ShopDashboardModule({orderlyUser, orderlyShop}: {orderlyUser: signedInUser, orderlyShop: IShop}){
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