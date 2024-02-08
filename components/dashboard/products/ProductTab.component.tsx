"use client"
import { clientSupabase } from "@/app/supabase/supabase-client"
import { pesewasToCedis, styledCedis } from "@/app/utils/frontend/utils"
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
import { popupText } from "@/components/Popup.component"
import { getAllProducts } from "@/app/utils/db/supabase-client-queries"

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

    // will the useffect run after a nav from one of the child pages?

    function sortByDateUpdated(a: Partial<Tables<'products'>>, b: Partial<Tables<'products'>>): -1 | 1 | 0 {
        
        if(!a.updated_at && !b.updated_at) return 0
        if(!a.updated_at) return 1
        if(!b.updated_at) return -1


        let firstDate = new Date(a.updated_at!)
        let nextDate = new Date(b.updated_at!)

        if( firstDate < nextDate) return 1
        if( firstDate > nextDate ) return -1
        if( firstDate == nextDate ) return 0
        
        return 0
    }


    useEffect(()=>{
        getAllProducts
        .eq('shop_id', shop.id)
        .then(({data, error}) =>{
            if(!error){
                let sortedProducts = data.sort(sortByDateUpdated)
                dispatch(setProducts(sortedProducts!))
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
                popupText(`Deleted ${selectedProduct!.name}`)
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
                        <h2 className="text-center text-2xl font-bold" >{selectedProduct?.name}</h2>
                        <span className="flex flex-col w-full gap-4 ">
                            <button onClick={()=>{handleDeleteProduct()}}>Delete Product</button>
                            <button className="btn-secondary" onClick={()=>{deleteDialogRef.current?.close()}} >Cancel</button>
                        </span>
                    </div>
                </dialog>

                <section className="w-full md:w-[calc(75%+8rem)]">
                    <div className="flex justify-between mb-4 md:mb-8">
                        <h1 className="font-bold text-2xl">My Products</h1>
                        <span>
                            <Link href={'/s/dashboard?tab=products&section=add'}><button><FontAwesomeIcon style={{width: '15px', height: '15px'}} icon={faAdd} /> Add<span className="hidden md:inline"> New Product</span></button></Link>
                        </span>
                    </div>
                    <div>
                        <div className="border-2 border-peach rounded-xl">
                            <div className="hidden md:grid bg-peach grid-cols-productListMob md:grid-cols-productList gap-6 p-4">
                                <p className="hidden md:flex justify-center">ID</p>
                                <p  className="flex justify-center" ><span className="hidden md:inline">Image</span></p>
                                <p><span className="hidden md:inline">Name and Description</span><span className="inline md:hidden">Details</span></p>
                                <p className="hidden md:flex justify-center" >Price</p>
                                <p className="flex justify-center">Actions</p>
                            </div>
                            <div className="md:max-h-[550px] max-h-[100vh-150px] overflow-auto">
                            {/* Loading state */}
                            { dataLoading && 
                                <>
                                    <div className="flex justify-center animate-pulse w-full p-4">
                                        Loading...
                                    </div>
                                </>
                            }
                            {/* Desktop View */}
                            { (!dataLoading) && (products!.length != 0) &&
                                products!.map((product, idx) => {
                                    return(
                                        <div className="hidden md:grid border-b-peach last:border-b-transparent hover:bg-gray-50 duration-150 grid-cols-productList gap-6 p-4" key={idx}>
                                            <p className="hidden md:flex justify-center items-center cursor-pointer" title={product.id}>#{product.id.slice(0,4)}</p>
                                            <span className="w-[45px] md:w-[70px] h-[45px] md:h-[70px] rounded-xl overflow-hidden flex justify-center items-center">
                                                <img src={product.imageURL!} />
                                            </span>
                                            <span className="flex flex-col truncate justify-center">
                                                <h1 className="font-medium text-xl">{product.name}</h1>
                                                <h2 className="text-gray-400">{product.description}</h2>
                                            </span>
                                            <p className=" flex items-center justify-center font-semibold">GHS{styledCedis(product.price!)}</p>
                                            <span className="flex flex-col md:flex-row justify-center items-center">
                                                <Link href={`/s/${shop.shopNameTag}?product=${product.id}`}><button className="w-full md:w-fit mr-2 btn-secondary">View<span className="hidden md:inline"> Product</span></button></Link>
                                                <button className="group relative bg-peach !border-transparent !rounded-full hover:bg-red !text-black hover:!text-white duration-150">
                                                    <FontAwesomeIcon width={15} height={15} icon={faEllipsisV}/>
                                                    <span className="absolute right-10 -top-5 hidden group-hover:flex flex-col rounded-lg overflow-hidden border-darkRed border-[1px] bg-white">
                                                        <Link href={`/s/dashboard?tab=products&section=edit&id=${product.id}`}  className="flex gap-2 p-2 duration-150 items-center bg-white text-black hover:bg-darkRed hover:text-white" >
                                                            <FontAwesomeIcon width={15} height={15} icon={faPen} />
                                                            Edit
                                                        </Link>
                                                        <span className="flex gap-2 p-2  duration-150 items-center bg-white text-black hover:bg-red hover:text-white" onClick={()=>{setSelectedProduct(product); deleteDialogRef.current?.showModal()}}>
                                                            <FontAwesomeIcon width={15} height={15} icon={faTrash} />
                                                            Delete
                                                        </span>
                                                    </span>
                                                </button>
                                            </span>
                                        </div>
                                    )
                                })
                            }
                            {/* Mobile View */}
                            { (!dataLoading) && (products!.length != 0) &&
                                products!.map((product, idx) => {
                                    return(
                                        <div className="border-b-peach border-2 md:hidden last:border-b-transparent hover:bg-gray-50 flex flex-col duration-150 gap-4 p-2 py-3" key={idx}>
                                            <span className="flex flex-row gap-4">
                                                <span className="w-[80px] h-[80px] rounded-lg overflow-hidden flex justify-center items-center">
                                                    <img src={product.imageURL!} />
                                                </span>
                                                <span className="w-[calc(100%-80px-0.5rem)] flex flex-col md:truncate justify-center">
                                                    <h1 className="font-semibold text-xl">{product.name}</h1>
                                                    <h2 className="text-gray-400 truncate">{product.description}</h2>
                                                    <p className="md:hidden font-semibold">GHS{pesewasToCedis(product.price!).toFixed(2).toLocaleString()}</p>
                                                </span>
                                            </span>
                                            <span className="flex flex-row gap-2 items-center">
                                                <Link href={`/s/${shop.shopNameTag}?product=${product.id}`} className="w-6/12">
                                                    <button className="w-full md:w-fit mr-2">
                                                        View Product
                                                    </button>
                                                    </Link>
                                                
                                                <span className="w-6/12 flex items-center justify-center gap-4">
                                                    <span className="w-2/3">
                                                        <Link href={`/s/dashboard?tab=products&section=edit&id=${product.id}`}>
                                                            <button className="flex items-center gap-2 btn-secondary rounded-full">
                                                                <FontAwesomeIcon style={{width: '15px', height: '15px'}} icon={faPen} />
                                                                Edit
                                                            </button>
                                                        </Link>
                                                    </span>
                                                    <span className="flex items-center justify-center rounded-full" onClick={()=>{setSelectedProduct(product); deleteDialogRef.current?.showModal()}}>
                                                        <FontAwesomeIcon style={{width: '15px', height: '15px'}} icon={faTrash} />
                                                    </span>
                                                </span>
                                            </span>
                                        </div>
                                    )
                                })
                            }
                            { !dataLoading &&  products!.length == 0 && 
                                <>
                                    <div className="flex w-full text-center justify-center p-4">
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