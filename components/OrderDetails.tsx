import { IOrderResponse } from "@/models/OrderProducts.model";
import Footer from "./Footer.component";
import Header from "./Header.component";


export default function OrderDetailsComponent({order}: {order: IOrderResponse}){



    return (
        <>
            <Header />
            <main className="w-screen h-[calc(100vh-50px-173px)] md:h-[calc(100vh-70px-66px)] grid place-items-center">
                <div className="w-[90%] max-w-[700px] h-full max-h-[500px]">
                    <div>

                    </div>
                    <div>
                        
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )

}