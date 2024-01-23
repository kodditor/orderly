'use client'

import { capitalizeAll } from "@/app/utils/frontend/utils"
import { RootState } from "@/constants/orderly.store"
import { faPhone } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Image from "next/image"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"


export default function ShopSideBar(){

    const {shop, user, products} = useSelector((state: RootState) => state.shopAndUser) 

    const [ dataLoading, setLoading ] = useState<boolean>(true)
    const [ genError, setError ] = useState<boolean>(false)

    if(!shop){
        return (
            <>
                <aside  className="hidden md:block z-30 fixed p-5 pt-8 bg-white w-[20vw] min-w-[240px] h-[calc(100%-72px)] md:top-[63px] min-h-[500px] border-r-2 border-grey-200 overflow-auto ">
                    <div className="flex flex-col gap-2 animate-pulse">
                        <div className=" aspect-square w-full mb-4 flex items-center rounded-full border-2 border-peach justify-center">
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

                    </div>
                </aside>
            </>
        )
    } else {
        return (
            <>
                <aside  className="hidden md:block fixed p-5 pt-8 pb-2 z-30 bg-white w-[20vw] min-w-[240px] h-[calc(100%-60px)] md:top-[63px] min-h-[500px] border-r-2 border-grey-200 overflow-auto ">
                    <div className="flex flex-col gap-2">
                        <div className=" aspect-square w-full mb-4 flex items-center rounded-full overflow-hidden border-2 border-peach justify-center">
                            <img className="w-full" src={shop.imageURL!} alt={`The ${shop.name} logo`}/>
                        </div>
                        <h1 className="text-2xl -mb-2">{shop.name}</h1>
                        <small className="text-gray-400">@{shop.shopNameTag}</small>
                        {/*@ts-ignore */}
                        <h6 className="text-md mb-4">{shop.location.city}, {shop.location.region}, {shop.location.country}</h6>
                        
                        <p className="mb-4">{shop.description}</p>
                        <small className="mb-4">{ capitalizeAll(shop.tags[0]) } • {capitalizeAll(shop.tags[1])} • {capitalizeAll(shop.tags[2])} • { capitalizeAll(shop.tags[3])}
                           
                        </small> 
                        <button> <FontAwesomeIcon className="mr-1" icon={faPhone} /> Contact Shop</button>
                    </div>
                </aside>
            </>
        )
    }

}