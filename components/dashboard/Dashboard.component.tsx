"use client"
import DashboardHeader from "./DashboardHeader.component"
import { useSearchParams } from "next/navigation"
import DashboardTabComponent from "./DashboardTab.component"
import ProductTabComponent from "./products/ProductTab.component"
import OrderTabComponent from "./orders/OrderTab.component"
import SettingsTabComponent from "./settings/SettingsTab.component"
import Footer from "../Footer.component"


export default function DashboardComponent(){
    
    const searchParams = useSearchParams()
    const tab = searchParams.get('tab')

   

    return (
        <>
            <DashboardHeader />
            <main className=" min-h-[calc(100vh-10rem)] md:min-h-fit mt-[50px] md:mt-0 md:ml-[clamp(240px,30vh,30vh)] p-8">
                { (tab == null || tab == 'dashboard') && <DashboardTabComponent /> }
                { (tab == 'products') && <ProductTabComponent /> }
                { (tab == 'orders') && <OrderTabComponent /> }
                { (tab == 'settings') && <SettingsTabComponent /> }
            </main>
            <section className="block md:hidden">
                <Footer />
            </section>
        </>
    )
}