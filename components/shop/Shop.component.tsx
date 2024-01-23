'use client'

import { useDispatch, useSelector } from "react-redux"
import { setShop, setProducts } from "@/constants/orderly.slice"
import { IShop } from "@/models/shop.model"
import Header from "../Header.component"
import Footer from "../Footer.component"
import { RootState } from "@/constants/orderly.store"
import { useEffect, useState } from "react"
import { clientSupabase } from "@/app/supabase/supabase-client"
import ShopSideBar from "./ShopSidebar.component"
import { capitalizeAll,  pesewasToCedis } from "@/app/utils/frontend/utils"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHeart } from "@fortawesome/free-regular-svg-icons"
import ProductItem from "./ProductItem.component"
import { Tables } from "@/types/supabase"

export default function Shop({selectedShop}: {selectedShop: IShop})
{
    const {shop, user, products} = useSelector((state: RootState) => state.shopAndUser) 

    const [ dataLoading, setLoading ] = useState<boolean>(true)
    const [ genError, setError ] = useState<boolean>(false)

    const supabase = clientSupabase

    const [ selectedProduct , setSelectedProduct ] = useState<Tables<'products'> | null>(null)
    const [showProduct, setShowProduct ] = useState<boolean>(false)

    const dispatch = useDispatch()
    dispatch(setShop(selectedShop))

    useEffect(()=>{
        supabase
        .from('products')
        .select('*')
        .eq('shop_id', shop.id)
        .then(({data, error}) =>{
            if(!error){
                dispatch(setProducts(data!))
                setLoading(false)
            } else {
                setError(true)
                setLoading(false)
            }
        })
    }, [selectedShop])

    function showProductItem(product: Tables<'products'>){
        setSelectedProduct(product)
        setShowProduct(true)
        console.log('selected: ', product.name)
    }

    function addToCart(product: Tables<'products'>){
        // Do something
    }

    return(
        <>
            <Header />
            <ShopSideBar />
            <ProductItem 
                isOpen={showProduct} 
                product={selectedProduct} 
                addToCart={addToCart} 
                setIsOpen={setShowProduct} 
            />
            
            <main className=" w-[100%] md:pl-[20vw] min-h-[calc(100vh-138px)]">
                <div className=" w-3/4 overflow-x-hidden h-full p-8">
                    <h1 className="font-extrabold text-3xl mb-8">Products</h1>
                    <section className="bg-gray-100 rounded-lg p-4 grid md:grid-cols-3 gap-5 w-full">
                        { products.map((product, idx) =>{
                            return (
                                <div className="bg-white cursor-pointer text-black rounded-xl flex flex-col p-8 w-full duration-150 hover:shadow-md" key={idx} onClick={()=>showProductItem(product)}>
                                    <div className="flex gap-4 h-full flex-col">
                                        <span className="w-full aspect-square flex items-center justify-center rounded-xl overflow-hidden">
                                            <img className="object-cover h-full" src={product.imageURL!}/>
                                        </span>
                                        <div className="flex flex-col h-1/2 justify-between">
                                            <div>
                                                <h2 className="text-lg mb-2">{product.name}</h2>
                                                <div className="w-full overflow-auto  flex gap-1">
                                                {
                                                    ( product.variations?.length != 0) && ( product.variations?.at(0) != '' ) && product.variations?.map((variation, idx) =>{
                                                    return(
                                                        <small className="bg-peach rounded-xl py-1 px-2" key={idx}>{capitalizeAll(variation)}</small>
                                                    )}
                                                    )
                                                }
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-2 flex-col">
                                                <span className="flex gap-1 items-baseline">
                                                    <small className="text-sm">GHS</small>
                                                    <h2 className="text-xl mb-0 font-extrabold">{pesewasToCedis(product.price!).toFixed(2).toLocaleString() }</h2>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                        }
                    </section>
                </div>
            </main>
            <Footer />
        </>
    )
}