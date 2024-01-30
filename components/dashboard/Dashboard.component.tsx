"use client"
import DashboardHeader from "./DashboardHeader.component"
import { useSearchParams } from "next/navigation"
import DashboardTabComponent from "./DashboardTab.component"
import ProductTabComponent from "./products/ProductTab.component"
import OrderTabComponent from "./orders/OrderTab.component"
import SettingsTabComponent from "./settings/SettingsTab.component"


export default function DashboardComponent(){
    
    const searchParams = useSearchParams()
    const tab = searchParams.get('tab')

   

    return (
        <>
            <DashboardHeader />
            <main className=" mt-[50px] md:mt-0 md:ml-[clamp(240px,30vh,30vh)] p-8">
                { (tab == null || tab == 'dashboard') && <DashboardTabComponent /> }
                { (tab == 'products') && <ProductTabComponent /> }
                { (tab == 'orders') && <OrderTabComponent /> }
                { (tab == 'settings') && <SettingsTabComponent /> }
            </main>
        </>
    )
}