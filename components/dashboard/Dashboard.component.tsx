"use client"
import type { RootState } from "@/constants/orderly.store"
import { useSelector } from 'react-redux'


export default function DashboardComponent(){
    const {shop, user} = useSelector((state: RootState) => state.shopAndUser)
   
    return (
        <>
            <h1>Hello, {user.firstName}</h1>
        </>
    )
}