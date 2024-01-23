"use client"
import { clientSupabase } from "@/app/supabase/supabase-client"

import { v4 as uuidv4 } from 'uuid';
import { cedisToPesewas, getBlobAndURLFromArrayBuffer, getCSV, getExtension, pesewasToCedis } from "@/app/utils/frontend/utils"
import { faArrowLeft, faUpload } from "@fortawesome/free-solid-svg-icons"
import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"
import { useState } from "react"
import type { RootState } from "@/constants/orderly.store"
import { useSelector, useDispatch } from "react-redux";


export default function AddProduct(){
    
    const {shop, user, products} = useSelector((state: RootState) => state.shopAndUser) 
    const dispatch = useDispatch()
    const router = useRouter()

    const [ productName, setProductName ] = useState<string|null>(null)
    const [ productDesc, setProductDesc ] = useState<string|null>(null)
    const [ productTags, setProductTags ] = useState<string[]|null>(null)
    const [ productVariations, setProductVariations ] = useState<string[]|null>(null)
    const [ productPrice, setProductPrice ] = useState<number|null>(null)
    const [ productImage, setShopLogo ] = useState<File| Blob | null>(null)
    const [ productImageURL, setShopLogoURL ] = useState<string | null>(null)
    const [ uploadedFileExt, setFileExt ] = useState<string>('')

    const [ submitted, setSubmitted ] = useState<boolean>(false)
    const [ submissionErr, setSubErr] = useState<boolean>(false)

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

    function handleCreateProduct(){
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
                id: newUUID,
                created_at: date.toISOString(),
                name: productName,
                description: productDesc,
                price: productPrice,
                variations: productVariations,
                tags: productTags,
                imageURL: publicUrl,
                shop_id: shop.id
            }
            supabase
            .from('products')
            .insert(insertObject)
            .then(({error})=>{
                if(!error){
                    router.push('/s/dashboard?tab=products')
                    setSubmitted(true)
                } else {
                    console.log('Error: ', error)
                    setSubmitted(true)
                }
            })
        })
        .catch((error) =>{
            console.log('Error: ', error)
        })
    }

    return(
        <>
            <section className="w-[calc(75%+8rem)]">
                <span className="mb-8 flex gap-4 items-center">
                    <Link href={'/s/dashboard?tab=products'} className="flex w-10 h-10 rounded-full items-center justify-center bg-peach hover:bg-darkRed hover:text-white duration-150"><FontAwesomeIcon icon={faArrowLeft} /></Link>
                    <h1 className="font-bold text-lg">Add A New Product</h1>
                </span>
                <div className="w-full grid grid-cols-2 rounded-2xl shadow-md overflow-hidden border-2 border-peach">
                    <div className="p-8">
                        <h3 className="text-2xl ml-2 mb-5">Product Details</h3>
                        <div className="flex flex-col gap-4">
                            <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Product Name" type="text" id='name' maxLength={50} onChange={(e)=>{setProductName(e.target.value)}} required/>
                            <textarea className="p-2 pl-4 bg-peach rounded-xl overflow-hidden w-full" placeholder="Product Description" rows={5} id='description' maxLength={350} onChange={(e)=>{setProductDesc(e.target.value)}} required/>
                        
                            <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Search Tags separated by a comma (eg. shops, ghana, orderly)"  maxLength={50} type="text" id='tags' onChange={(e)=>{setProductTags( getCSV(e.target.value) )}} required/>
                            <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Product Variations (eg. Small, Medium, Large )"  maxLength={50} type="text" id='variations' onChange={(e)=>{setProductVariations( getCSV(e.target.value) )}} required/>
                            <span className="w-full flex items-baseline gap-2">
                                <small className="text-sm">GHS</small>
                                <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Price (GHS)" type="number" pattern="^\d*(\.\d{0,2})?$" step='.01' max={1000000} min={1} id='price' onChange={(e)=>{setProductPrice( cedisToPesewas(e.target.valueAsNumber) )}} required/>
                            </span>                            
                            <span className="w-full"> 
                                <label className="bg-peach group rounded-xl hover:bg-darkRed flex w-full p-3 font-bold text-black hover:text-white duration-150 cursor-pointer justify-center items-center gap-3 mb-2" htmlFor="logo">
                                    Upload the product Image <FontAwesomeIcon icon={faUpload} />
                                </label>
                                <input className="p-2 pl-4 bg-peach rounded-full w-full hidden"   accept="image/*" type="file" multiple={false} id='logo' maxLength={30} onChange={(e)=>{handleImageChange(e.target.files![0])}} required/>
                                <p className="text-red font-medium text-center" style={{display: (submissionErr)? 'block': 'none' }}>File size is too large. Please upload files less than 500KB.<br />You can use <a href="https://tinypng.com/" className=" underline">tinyPNG</a> to reduce your file size.</p>
                            </span>
                            <button className="rounded-full w-full mb-2" disabled={submitted} onClick={(e)=>{e.preventDefault(); } } >
                                <div style={{display: submitted ? 'block' : 'none'}} id="loading"></div>
                                <span style={{display: submitted ? 'none' : 'block'}} onClick={()=>{handleCreateProduct()}}>Showcase Your Product</span>
                            </button>
                        </div>
                    </div>
                    <div className="bg-red p-8 flex items-center justify-center">
                        <div className="bg-white text-black rounded-xl flex gap-4 flex-col p-8 w-2/3 shadow-md">
                            <span className="w-full aspect-square flex items-center justify-center border-2 border-gray-200 rounded-xl overflow-hidden">
                                <img className="object-cover h-full" src={ productImageURL ?? '/img/logo.png'}/>
                            </span>
                            <h2 className="text-xl -mb-2">{productName ? productName : 'Product Name'}</h2>
                            <div className="w-full overflow-auto  -mb-2 flex gap-2">
                            {
                                ( productVariations?.length != 0) && ( productVariations?.at(0) != '' ) && productVariations?.map((variation, idx) =>{
                                return(
                                    <div className="bg-peach rounded-xl p-2" key={idx}>{variation}</div>
                                )}
                                )
                            }
                            </div>

                            <span className="flex gap-1 items-baseline">
                                <small className="text-sm">GHS</small>
                                <h2 className="text-2xl mb-0 font-extrabold">{productPrice ? pesewasToCedis(productPrice!).toFixed(2).toLocaleString() : '0.00' }</h2>
                            </span>
                            <button>Add To Cart</button>
                        </div>
                    </div>

                </div>
            </section>
        </>
    )

    
}