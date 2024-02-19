import { capitalizeAll, pesewasToCedis, styledCedis } from "@/app/utils/frontend/utils";
import { IOrderProducts } from "@/models/OrderProducts.model";
import { Tables } from "@/types/supabase";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";


export default function ProductItem({product, allProducts, isOpen, setIsOpen, addToCart, removeFromCart} :{product:Tables<'products'> | null, isOpen:boolean, allProducts: IOrderProducts[],  setIsOpen:Dispatch<SetStateAction<boolean>>, addToCart:Function, removeFromCart: (product:Tables<'products'>)=>void}){
    
    if(isOpen && ( product != null ))
    {

        let productIndexInCart: number | null = null
        if( allProducts.length == 0){null}
        else {
            for (let i = 0; i < allProducts.length; ++i){
                if(allProducts[i].product_id === product.id){
                    productIndexInCart = i
                }
            }
        }


        return (
            <>
                <div className="fixed top-0 flex flex-col md:flex-row w-full h-screen z-[51]">
                    <div className=" bg-gray-400 opacity-40 w-full h-[30%] md:h-full md:w-[50%] xl:w-[65%]" onClick={()=>{setIsOpen(false)}}></div>
                    <div className="bg-white opacity-100 shadow-lg w-full md:mt-0 md:w-[50%] xl:w-[35%] h-[70%] overflow-y-auto md:h-full p-4 pt-6 md:pt-16 md:p-16 ">
                        <div className="flex flex-col justify-between h-[calc(100%-4rem)]">
                            <div>
                                <div className="w-full flex flex-col md:flex-row gap-2 md:gap-8">
                                    <span className="w-full md:w-2/5 aspect-square rounded-xl border-2 border-gray-200 overflow-hidden flex justify-center items-center">
                                        <img src={product.imageURL!} />
                                    </span>
                                
                                    <div className="w-full md:w-3/5 md:pt-3">
                                        <small className="text-gray-400">#{product.id.slice(0,7)}</small>
                                        <h1 className="text-3xl mb-4 mt-2">{product.name}</h1>
                                        <div className="flex overflow-x-auto md:flex-wrap mb-3 gap-1">
                                        {
                                            ( product.variations?.length != 0) && ( product.variations?.at(0) != '' ) && product.variations?.map((variation, idx) =>{
                                            return(
                                                <p className="bg-peach rounded-xl py-1 px-2 mr-2 md:mr-4 last:mr-0" key={idx}>{capitalizeAll(variation)}</p>
                                            )}
                                            )
                                        }
                                        </div>
                                        <div className="flex overflow-x-auto md:flex-wrap gap-1">
                                        {
                                            ( product.tags?.length != 0) && ( product.tags?.at(0) != '' ) && product.tags?.map((tag, idx) =>{
                                            return(
                                                <p className="bg-gray-100 text-gray-500 rounded-xl py-1 px-2 mr-2 md:mr-4 last:mr-0" key={idx}>{capitalizeAll(tag)}</p>
                                            )}
                                            )
                                        }
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 md:mt-8">
                                    <div>
                                        <small className="text-red">Description</small>
                                        <p className="text-xl">{product.description}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row gap-2 md:gap-4 md:items-end mt-3 md:mt-2" >
                                <span className="w-full md:w-1/3">
                                    <small className="text-red mb-1">Price</small>
                                    <span className="flex gap-1 items-baseline">
                                        <small className="text-md mb-1">GHS</small>
                                        <h2 className="text-3xl mb-0 font-bold">{styledCedis(product.price!) }</h2>
                                    </span>
                                </span>
                                <div className="w-full flex gap-2 md:gap-4 mb-4 mt-2 md:mt-0 md:mb-0 items-center md:items-end" >
                                    <span  className="w-1/2" >
                                        <span className="w-full">
                                            <button className="w-full"  style={{display: (productIndexInCart != null ? 'none': 'block')}} onClick={()=>{addToCart(product)}}>Add to Cart</button>
                                            <span style={{display: (productIndexInCart == null ? 'none': 'flex')}} className="bg-white border-2 border-gray-200 w-full flex gap-2 items-center justify-between p-[0.2rem] rounded-full">
                                                <span  className={`text-gray-400 cursor-pointer rounded-full w-7 h-7 flex items-center justify-center duration-150 ${(productIndexInCart == null) ? '' : 'hover:bg-red hover:text-white'}`} onClick={(e)=>{e.stopPropagation(); (productIndexInCart == null) ? null : removeFromCart(product)} }><FontAwesomeIcon width={12} height={12} icon={faMinus} /></span>
                                                <span  className="text-sm text-gray-500 font-black items-center">{productIndexInCart != null ? allProducts[productIndexInCart].quantity : 0 }</span>
                                                <span className={`text-gray-400 cursor-pointer rounded-full w-7 h-7 flex items-center justify-center duration-150 hover:bg-red hover:text-white`} onClick={(e)=>{e.stopPropagation(); addToCart(product)}}><FontAwesomeIcon width={12} height={12} icon={faPlus} /></span>
                                            </span>
                                        </span>
                                    </span>
                                    <span  className="w-1/2" >
                                        <button className=" btn-secondary w-full" onClick={()=>{setIsOpen(false)}}>Close</button>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}