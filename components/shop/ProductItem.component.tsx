import { capitalizeAll, pesewasToCedis } from "@/app/utils/frontend/utils";
import { Tables } from "@/types/supabase";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";


export default function ProductItem({product, isOpen, setIsOpen, addToCart} :{product:Tables<'products'> | null, isOpen:boolean,  setIsOpen:Dispatch<SetStateAction<boolean>>, addToCart:Function}){
    
    if(isOpen && product != null)
    {
        return (
            <>
                <div className="fixed flex w-full h-full z-40">
                    <div className=" bg-gray-400 opacity-40 w-[50%]"></div>
                    <div className="bg-white opacity-100 shadow-lg w-full mt-[30%] md:mt-0 md:w-[50%] h-full md:h-70% p-16 ">
                        <div  className="flex flex-col justify-between h-[calc(100%-8rem)]">
                            <div>
                                <div className="w-full flex gap-8">
                                    <div className="w-2/5 aspect-square border-2 object-cover border-gray-400 relative overflow-hidden rounded-xl">
                                        <Image src={product.imageURL!} alt="" fill />
                                    </div>
                                    <div className="w-3/5 pt-3">
                                        <small className="text-gray-400"># {product.id.slice(0,7)}</small>
                                        <h1 className="text-3xl mb-4 mt-2">{product.name}</h1>
                                        <div className="flex flex-wrap mb-3 gap-1">
                                        {
                                            ( product.variations?.length != 0) && ( product.variations?.at(0) != '' ) && product.variations?.map((variation, idx) =>{
                                            return(
                                                <p className="bg-peach rounded-xl py-1 px-2 mr-4 last:mr-0" key={idx}>{capitalizeAll(variation)}</p>
                                            )}
                                            )
                                        }
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                        {
                                            ( product.tags?.length != 0) && ( product.tags?.at(0) != '' ) && product.tags?.map((tag, idx) =>{
                                            return(
                                                <p className="bg-gray-100 text-gray-500 rounded-xl py-1 px-2 mr-4 last:mr-0" key={idx}>{capitalizeAll(tag)}</p>
                                            )}
                                            )
                                        }
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8">
                                    <div>
                                        <small className="text-red">Description</small>
                                        <p className="text-xl">{product.description}</p>
                                    </div>
                                </div>
                            </div>
                            <div className=" flex gap-4 items-end" >
                                <span className="w-1/3">
                                    <small className="text-red mb-1">Price</small>
                                    <span className="flex gap-1 items-baseline">
                                        <small className="text-md mb-[3px]">GHS</small>
                                        <h2 className="text-3xl mb-0 font-extrabold">{pesewasToCedis(product.price!).toFixed(2).toLocaleString() }</h2>
                                    </span>
                                </span>
                                <span  className="w-1/3" >
                                    <button className="w-full" onClick={()=>{addToCart(product)}}>Add to Cart</button>
                                </span>
                                <span  className="w-1/3" >
                                    <button className=" btn-secondary w-full" onClick={()=>{setIsOpen(false)}}>Close</button>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}