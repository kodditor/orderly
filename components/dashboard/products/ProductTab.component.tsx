"use client"
import { clientSupabase } from "@/app/supabase/supabase-client"
import { pesewasToCedis } from "@/app/utils/frontend/utils"
import { faAdd, faEllipsisV, faPen, faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from "@/constants/orderly.store"
import { Tables } from "@/types/supabase"
import { setProducts, removeProduct } from "@/constants/orderly.slice"
import AddProduct from "./AddProduct.component"
import EditProduct from "./EditProduct.component"

export default function ProductTabComponent(){

    const {shop, user, products} = useSelector((state: RootState) => state.shopAndUser) 
    const dispatch = useDispatch()

    const router = useRouter()

    const [ dataLoading, setLoading ] = useState<boolean>(true)
    const [ selectedProduct, setSelectedProduct ] = useState<Tables<'products'>| null >(null)

    const [ genError, setError ] = useState<boolean>(false)
    
    const deleteDialogRef = useRef<HTMLDialogElement>(null)

    const searchParams = useSearchParams()
    const section = searchParams.get('section')

    const supabase = clientSupabase;

    // will the useffect run after a nav fron one of the child pages?

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

    }, [section]) // rerender on every section change?
    


    function handleDeleteProduct(){
        supabase
        .from('products')
        .delete()
        .eq('id', selectedProduct!.id)
        .then(({data, error}) =>{
            if(!error){
                console.log(data)
                dispatch(removeProduct(selectedProduct!))
                deleteDialogRef.current?.close()

            } else {
                console.log('Error: ', error)
            }
        })
    }


    if(section == 'add'){
        return(
            <AddProduct />
        )
    }
    else if ( section == 'edit'){
        const prodID = searchParams.get('id')
        if (prodID != null && (products.length != 0)){
    
            let editProduct = products.find(({id}) => id === prodID )
            if(editProduct){
                
                return (
                    <EditProduct product={editProduct} />
                )

            }
            else{
                return (
                    <>
                        <div className="w-full h-[calc(100vh-4rem)] flex flex-col items-center gap-6 justify-center">
                            <h1 className="font-bold text-5xl ">404</h1>
                            <h2 className="font-bold text-lg">Product not found</h2>
                        </div>
                    </>
                )
            }
        }
        else {
           return (
            <>
                <div className="w-full h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4">
                    <img className="animate-pulse w-72 md:w-96" src="/img/logo.png"/>
                    <h1 className="font-bold text-lg animate-pulse ">Loading Product Details...</h1>
                </div>
            </>
           )
        }

    } else {
        return (
            <>
                <dialog ref={deleteDialogRef} className="p-8 border-2 w-96 border-peach rounded-xl">
                    <div className="flex flex-col gap-4">
                        <h1 className="text-xl text-center">Are You sure you want to delete this product?</h1>
                        <h2 className="text-center text-2xl font-extrabold" >{selectedProduct?.name}</h2>
                        <span className="flex flex-col w-full gap-4 ">
                            <button onClick={()=>{handleDeleteProduct()}}>Delete Product</button>
                            <button className="btn-secondary" onClick={()=>{deleteDialogRef.current?.close()}} >Cancel</button>
                        </span>
                    </div>
                </dialog>

                <section className="w-[calc(75%+8rem)]">
                    <div className="flex justify-between mb-8">
                        <h1 className="font-bold text-2xl">My Products</h1>
                        <span>
                            <Link href={'/s/dashboard?tab=products&section=add'}><button><FontAwesomeIcon icon={faAdd} /> Add New Product</button></Link>
                        </span>
                    </div>
                    <div>
                        <div className="border-2 border-peach rounded-xl">
                            <div className="bg-peach grid grid-cols-productList gap-6 p-4">
                                <p className="flex justify-center">Product #</p>
                                <p  className="flex justify-center" >Image</p>
                                <p>Name and Description</p>
                                <p className="flex justify-center" >Price</p>
                                <p className="flex justify-center">Actions</p>
                            </div>
                            <div className="max-h-[550px]  overflow-auto">
                            { dataLoading && 
                                <>
                                    <div className="flex justify-center animate-pulse w-full p-4">
                                        Loading...
                                    </div>
                                </>
                            }

                            { (!dataLoading) && (products!.length != 0) &&
                                products!.map((product, idx) => {
                                    return(
                                        <div className="border-b-peach last:border-b-transparent hover:bg-gray-50 duration-150 grid grid-cols-productList gap-6 p-4" key={idx}>
                                            <p className="flex justify-center items-center"># {product.id.slice(0,4)}</p>
                                            <span className="w-[70px] h-[70px] rounded-xl overflow-hidden flex justify-center items-center">
                                                <img src={product.imageURL!} />
                                            </span>
                                            <span className="flex flex-col truncate justify-center">
                                                <h1 className="font-black text-xl">{product.name}</h1>
                                                <h2 className="text-gray-400">{product.description}</h2>
                                            </span>
                                            <p className="flex justify-center items-center font-black">GHS{pesewasToCedis(product.price!).toFixed(2).toLocaleString()}</p>
                                            <span className="flex justify-center items-center">
                                                <Link href={`/s/${shop.shopNameTag}/product/${product.id}`}><button className="mr-2 btn-secondary">View Product</button></Link>
                                                <button className="btn-secondary group w-10 h-10 relative rounded-full">
                                                    <FontAwesomeIcon icon={faEllipsisV} />
                                                    <span className=" hidden group-hover:block z-10 absolute -top-5 right-[38px] bg-gray-100 rounded-xl overflow-hidden border-2 border-peach">
                                                        <Link href= {`/s/dashboard?tab=products&section=edit&id=${product.id}`}  className="flex gap-2 text-black items-center p-2 hover:bg-darkRed duration-150 hover:text-white"><FontAwesomeIcon icon={faPen} /><span>Edit</span></Link>
                                                        <div onClick={()=>{setSelectedProduct(product); deleteDialogRef.current?.showModal() }} className="text-red flex gap-2 p-2 items-center duration-150 hover:bg-red hover:text-white"><FontAwesomeIcon icon={faTrash}/><span>Delete</span></div>
                                                    </span>
                                                </button>
                                            </span>
                                        </div>
                                    )
                                })
                            }
                            { !dataLoading &&  products!.length == 0 && 
                                <>
                                    <div className="flex w-full justify-center p-4">
                                        Oh no! It's empty. Add a new product to begin!
                                    </div>
                                </> 
                            }

                            </div>
                        </div>
                    </div>
                </section>
            </>
        )
    }
}