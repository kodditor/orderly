'use client'

import { RootState } from "@/constants/orderly.store"
import { IShopCart } from "@/models/OrderProducts.model"
import { faPhone, faShoppingBasket, faShoppingCart } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Dispatch, SetStateAction } from "react"
import { useSelector } from "react-redux"


export default function ShopSideBar({ showCart, setShowCart, cart }: 
        {   
            showCart: boolean, 
            setShowCart: Dispatch<SetStateAction<boolean>>, 
            cart: IShopCart
        }
    ){

    const {shop} = useSelector((state: RootState) => state.shopAndUser) 

    //console.log(shop)

    if(shop.name == ''){
        return (
            <>
                <aside  className="hidden md:block z-30 fixed p-5 pt-8 bg-white w-[20vw] min-w-[240px] h-[calc(100%-72px)] md:top-[63px] min-h-[500px] border-r-2 border-grey-200 overflow-auto ">
                    <div className="flex flex-col gap-2 animate-pulse">
                        <div className=" aspect-square w-1/3 md:w-full md:max-w-[200px] mb-4 flex items-center rounded-full border-2 border-peach justify-center">
                            <img className="w-full saturate-0 animate-pulse" src={'/img/logo.png'} alt="The Orderly logo"/>
                        </div>
                        <div className="w-full h-5 bg-gray-300 rounded-full"></div>
                        <div className="w-2/3 h-5 mb-2 bg-gray-300 rounded-full"></div>
                        
                        <div className="w-3/4 h-3 mb-6 bg-gray-300 rounded-full"></div>
                        
                        <div className="w-full h-4 bg-gray-300 rounded-full"></div>
                        <div className="w-full h-4 bg-gray-300 rounded-full"></div>
                        <div className="w-full h-4 bg-gray-300 rounded-full"></div>
                        <div className="w-3/4 h-3 bg-gray-300 rounded-full mb-6"></div>
                        
                        <div className="flex justify-evenly mb-6">
                            <span className="bg-gray-300 inline-block w-1/5 h-6 rounded-md"></span>
                            <span className="bg-gray-300 inline-block w-1/5 h-6 rounded-md"></span>
                            <span className="bg-gray-300 inline-block w-1/5 h-6 rounded-md"></span>
                            <span className="bg-gray-300 inline-block w-1/5 h-6 rounded-md"></span>
                        </div>
                        <button disabled > <FontAwesomeIcon className="mr-1" icon={faPhone} /> Contact Business</button>
                        <button disabled > <FontAwesomeIcon className="mr-1" icon={faShoppingBasket} /> View Cart</button>
                    </div>
                </aside>
            </>
        )
    } else {
        return (
            <>
                <aside  className="block md:fixed p-4 md:p-5 md:pt-8 md:pb-2 z-30 bg-white w-full md:w-[20vw] md:min-w-[240px] md:h-[calc(100%-60px)] md:top-[63px] md:min-h-[500px] border-b-2 md:border-r-2 border-grey-200 overflow-auto ">
                    <div className="flex flex-col" >
                        <div className="flex flex-row md:flex-col items-center gap-4 md:gap-2" >
                            <div className="aspect-square w-1/3 md:w-full md:max-w-[200px] md:m-auto mb-4 flex items-center rounded-full overflow-hidden border-2 border-peach justify-center">
                                <img className="w-full" src={shop.imageURL!} alt={`The ${shop.name} logo`}/>
                            </div>
                            <div className="flex flex-col gap-1 md:gap-2">
                                <h1 className="text-2xl md:text-center font-semibold -mb-1">{shop.name}</h1>
                                <small className="text-red opacity-70 md:text-center">@{shop.shopNameTag}</small>
                                {/*@ts-ignore */}
                                <h6 className="text-md text-gray-400 font-normal md:text-center md:mb-2">{ shop.location && (shop.location.city + ", "+ shop.location.region + ", " + shop.location.country)}</h6>
                            </div>
                        </div>
                        
                        
                        <p className="mb-0 md:text-center md:mb-4">{shop.description}</p>
                        {/*}
                        <small className="mb-2 md:mb-4">{ capitalizeAll(shop.tags[0]) } • {capitalizeAll(shop.tags[1])} • {capitalizeAll(shop.tags[2])} • { capitalizeAll(shop.tags[3])}
                           
                        </small> */} 
                        <span className="flex flex-col gap-4 mt-4">
                            <button className="btn-secondary mt-3 md:mt-0 w-fit md:w-full"> <FontAwesomeIcon className="mr-1" width={15} height={15} icon={faPhone} /> Contact Shop</button>
                            <button className="hidden md:flex items-center justify-center gap-2 mt-3 md:mt-0 w-fit md:w-full" onClick={()=>setShowCart(true)}> <FontAwesomeIcon className="mr-1" width={15} height={15} icon={faShoppingCart} /> My Cart ({cart.products?.length})</button>
                        </span>
                    </div>
                </aside>
            </>
        )
    }

}