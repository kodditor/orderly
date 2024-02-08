"use client"
import { v4 as uuidv4 } from 'uuid';
import { faArrowLeft, faUpload } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { RootState } from "@/constants/orderly.store"
import { useSelector } from "react-redux";
import { clientSupabase } from "@/app/supabase/supabase-client"
import { TablesInsert } from "@/types/supabase";

import { popupText } from "@/components/Popup.component";
import { cedisToPesewas, getBlobAndURLFromArrayBuffer, getCSV, getExtension, pesewasToCedis, styledCedis } from "@/app/utils/frontend/utils"

export default function AddProduct(){
    
    const { shop } = useSelector((state: RootState) => state.shopAndUser) 
    const router = useRouter()

    const [ newProduct, setNewProduct       ] = useState<TablesInsert<'products'>>({})

    const [ productImage, setShopLogo       ] = useState<File| Blob | null>(null)
    const [ productImageURL, setShopLogoURL ] = useState<string | null>(null)
    const [ uploadedFileExt, setFileExt     ] = useState<string>('')

    const [ submitted, setSubmitted         ] = useState<boolean>(false)
    const [ submissionErr, setSubErr        ] = useState<boolean>(false)

    const supabase = clientSupabase;
    
    function handleImageChange(file: File){
        setFileExt(getExtension(file.name)!)
        if(file.size > 524288){
            setSubErr(true)
        }
        else {
            setSubErr(false)
            file.arrayBuffer().then((arrayBuffer) => {
                const {blob, imageUrl} = getBlobAndURLFromArrayBuffer(arrayBuffer,file)
                setShopLogo(blob)
                setShopLogoURL(imageUrl)
            })
        }
    }

    function handleValueChange(e: any){
        let field = e.target.name
        let value = e.target.value

        switch (field) {
            case 'variations':
                setNewProduct( (prev) =>{
                    return (
                        {
                            ...prev,
                            variations: getCSV(value).slice(0, 4)
                        }
                    )
                })

                break;

            case 'tags':
                setNewProduct( (prev) =>{
                    return (
                        {
                            ...prev,
                            tags: getCSV(value).slice(0, 4)
                        }
                    )
                })

                break;
            case 'price':
                setNewProduct( (prev) =>{
                    return (
                        {
                            ...prev,
                            price: cedisToPesewas(value)
                        }
                    )
                })
                break

            default:
                setNewProduct( (prev) =>{
                    return (
                        {
                            ...prev,
                            [field]: value
                        }
                    )
                })
                break;
        }
    }


    function handleCreateProduct(e:any){
        e.preventDefault()

        let newUUID = uuidv4()
        let date = new Date()

        setSubmitted(true)
    
        supabase.storage
        .from("Orderly Shops")
        .upload(`public/product/${newUUID}.${uploadedFileExt}`, productImage!, {
            cacheControl: '3600',
            upsert: true
        }).then((data)=>{
            let { data: {publicUrl}} = supabase.storage.from('Orderly Shops').getPublicUrl(data.data!.path)
            let insertObject = {
                ...newProduct,
                id: newUUID,
                created_at: date.toISOString(),
                imageURL: publicUrl,
                shop_id: shop.id
            }
            supabase
            .from('products')
            .insert(insertObject)
            .then(({error})=>{
                if(!error){
                    popupText(`Added New Product: ${newProduct.name}`)
                    router.push('/s/dashboard?tab=products')
                    setSubmitted(true)
                } else {
                    popupText('An error occurred. Please try again later')
                    console.log('Error: ', error)
                    setSubmitted(true)
                }
            })
        })
        .catch((error) =>{
            popupText('An error occurred. Please try again later')
            console.log('Error: ', error)
        })
    }

    return(
        <>
            <section className="w-full md:w-[calc(75%+8rem)]">
                <span className="mb-4 md:mb-8 flex gap-4 items-center">
                    <Link href={'/s/dashboard?tab=products'} className="flex w-10 h-10 rounded-full items-center justify-center bg-peach hover:bg-darkRed hover:text-white duration-150"><FontAwesomeIcon icon={faArrowLeft} /></Link>
                    <h1 className="font-bold text-lg">Add A New Product</h1>
                </span>
                <div className="w-full flex flex-col md:grid grid-cols-2 rounded-2xl shadow-md overflow-hidden border-2 border-peach">
                    <div className="p-4 md:p-8">
                        <h3 className="text-2xl mb-2 md:mb-5">Product Details</h3>
                        <form onSubmit={handleCreateProduct} className="flex flex-col gap-3">
                            <span>
                                <label className="mb-2 text-sm" htmlFor="name">Name</label>
                                <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Product Name" type="text" id='name' name="name" maxLength={50} onChange={handleValueChange} required/>
                            </span>
                            <span>
                                <label className="mb-2 text-sm" htmlFor="description">Description</label>
                                <textarea className="p-2 pl-4 bg-peach rounded-xl overflow-hidden w-full" placeholder="Product Description" rows={5} id='description' name="description" maxLength={350} onChange={handleValueChange} required/>
                            </span>
                            <span>
                                <label className="mb-2 text-sm" htmlFor="tags">Search Tags</label>
                                <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Search Tags separated by a comma (eg. shops, ghana, orderly)"  maxLength={50} type="text" name="tags" id='tags' onChange={handleValueChange}/>
                            </span>
                            <span>
                                <label className="mb-2 text-sm" htmlFor="variations">Variations</label>
                                <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Product Variations (eg. Small, Medium, Large )"  maxLength={50} type="text" name="variations" id='variations' onChange={handleValueChange}/>
                            </span>
                            <span className="w-full flex items-baseline gap-2">
                                <small className="text-sm">GHS</small>
                                <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Price (GHS)" type="number" pattern="^\d*(\.\d{0,2})?$" step='.01' max={1000000} min={1} id='price' name="price" onChange={handleValueChange} required/>
                            </span>                            
                            <span className="w-full"> 
                                <label className="bg-peach group rounded-xl hover:bg-darkRed flex w-full p-3 font-bold text-black hover:text-white duration-150 cursor-pointer justify-center items-center gap-3 mb-2" htmlFor="logo">
                                    Upload the product Image <FontAwesomeIcon icon={faUpload} />
                                </label>
                                <input className="p-2 pl-4 bg-peach rounded-full w-full hidden"   accept="image/*" type="file" multiple={false} id='logo' maxLength={30} onChange={(e)=>{handleImageChange(e.target.files![0])}} required/>
                                <p className="text-red font-medium text-center" style={{display: (submissionErr)? 'block': 'none' }}>File size is too large. Please upload files less than 500KB.<br />You can use <a href="https://tinypng.com/" className=" underline">tinyPNG</a> to reduce your file size.</p>
                            </span>
                            <button className="rounded-full w-full mb-2" disabled={submitted}>
                                <div style={{display: submitted ? 'block' : 'none'}} id="loading"></div>
                                <span style={{display: submitted ? 'none' : 'block'}}>Showcase Your Product</span>
                            </button>
                        </form>
                    </div>
                    <div className="bg-darkRed p-4 md:p-8 flex items-center justify-center">
                        <div className="bg-white text-black rounded-xl flex gap-4 flex-col p-4 md:p-8 w-full md:w-2/3 shadow-md">
                            <span className="w-full aspect-square rounded-xl border-2 border-gray-200 overflow-hidden flex justify-center items-center">
                                <img src={ productImageURL ?? '/img/chevron-logo.png'} />
                            </span>
                            <h2 className="text-xl -mb-2">{newProduct.name ? newProduct.name : 'Product Name'}</h2>
                            <div className="w-full overflow-auto flex-wrap  -mb-2 flex gap-2">
                            {
                                ( newProduct.variations?.length != 0) && ( newProduct.variations?.at(0) != '' ) && newProduct.variations?.map((variation, idx) =>{
                                return(
                                    <div className="bg-peach rounded-xl p-2" key={idx}>{variation}</div>
                                )}
                                )
                            }
                            </div>

                            <span className="flex gap-1 items-baseline">
                                <small className="text-sm">GHS</small>
                                <h2 className="text-2xl mb-0 font-bold">{newProduct.price ? styledCedis(newProduct.price!) : '0.00' }</h2>
                            </span>
                        </div>
                    </div>

                </div>
            </section>
        </>
    )

    
}