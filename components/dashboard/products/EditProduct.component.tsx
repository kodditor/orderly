"use client"
import { clientSupabase } from "@/app/supabase/supabase-client"

import { v4 as uuidv4 } from 'uuid';
import { cedisToPesewas, getBlobAndURLFromArrayBuffer, getCSV, getExtension, pesewasToCedis, styledCedis } from "@/app/utils/frontend/utils"
import { faArrowLeft, faUpload } from "@fortawesome/free-solid-svg-icons"
import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"
import { useState } from "react"
import { Tables, TablesUpdate } from "@/types/supabase";


export default function EditProduct({product}: {product: Tables<'products'>}){
    
    //const {shop, user, products} = useSelector((state: RootState) => state.shopAndUser) 
    const router = useRouter()

    const [ updatedProduct, setUpdatedProduct] = useState<TablesUpdate<'products'>>({})

    const [ productImage, setShopLogo ] = useState<File| Blob | null>(null)
    const [ productImageURL, setShopLogoURL ] = useState<string | null>(null)
    const [ uploadedFileExt, setFileExt ] = useState<string>('')
    const [ imageChanged, setChangedImage ] = useState<boolean>(false) 
    const [ valueChanged, setValueChanged ] = useState<boolean>(false) 

    const [ submitted, setSubmitted ] = useState<boolean>(false)
    const [ submissionErr, setSubErr] = useState<boolean>(false)

    const supabase = clientSupabase;

    function handleImageChange(file: File){
        setFileExt(getExtension(file.name)!)
        setChangedImage(true)

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
        !valueChanged ? setValueChanged(true) : null 

        switch (field) {
            case 'variations':
                setUpdatedProduct( (prev) =>{
                    return (
                        {
                            ...prev,
                            variations: getCSV(value).slice(0, 4)
                        }
                    )
                })

                break;

            case 'tags':
                setUpdatedProduct( (prev) =>{
                    return (
                        {
                            ...prev,
                            tags: getCSV(value).slice(0, 4)
                        }
                    )
                })

                break;
            case 'price':
                setUpdatedProduct( (prev) =>{
                    return (
                        {
                            ...prev,
                            price: cedisToPesewas(value)
                        }
                    )
                })
                break

            default:
                setUpdatedProduct( (prev) =>{
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

    function handleUpdateProduct(){
        let newUUID = uuidv4()
        let date = new Date()

        setSubmitted(true)
    
        //@ts-ignore
        let updateObject: Tables<'products'> = {
            ...updatedProduct,
            updated_at: date.toISOString()
        }
        if(imageChanged){
            supabase.storage
            .from("Orderly Shops")
            .upload(`public/product/${newUUID}.${uploadedFileExt}`, productImage!, {
                cacheControl: '3600',
                upsert: true
            }).then((data)=>{
                let { data: {publicUrl}} = supabase.storage.from('Orderly Shops').getPublicUrl(data.data!.path)
                
                updateObject.imageURL = publicUrl
                //console.log(updateObject)
                supabase
                .from('products')
                .update(updateObject)
                .eq('id', product.id)
                .then((res)=>{
                    if (!res.error){
                        router.push('/s/dashboard?tab=products')
                        setSubmitted(false)
                    } else {
                        setSubmitted(false)
                        console.log(res.error)
                    }
                })
            })
            .catch((error) =>{
                console.log('Error: ', error)
            })

        } else {
            supabase
            .from('products')
            .update(updateObject)
            .eq('id', product.id)
            .then((res)=>{
                if (!res.error){
                    router.push('/s/dashboard?tab=products')
                    setSubmitted(false)
                } else {
                    setSubmitted(false)
                    console.log(res.error)
                }
            })
        }
    }

    return(
        <>
            <section className="w-full md:w-[calc(75%+8rem)]">
                <span className="mb-4 md:mb-6 flex gap-4 items-center">
                    <Link href={'/s/dashboard?tab=products'} className="flex w-10 h-10 rounded-full items-center justify-center bg-peach hover:bg-darkRed hover:text-white duration-150"><FontAwesomeIcon icon={faArrowLeft} /></Link>
                    <h1 className="font-bold text-lg">Edit Product: <br className="md:hidden" /><span className="text-red">{product.name}</span></h1>
                </span>
                <div className="w-full flex flex-col gap-4 md:gap-0 md:grid grid-rows-1 grid-cols-2 rounded-lg md:rounded-2xl shadow-md overflow-hidden border-2 border-peach">
                    <div className="p-4 md:p-8">
                        <h3 className="text-2xl mb-3">Product Details</h3>
                        <div className="flex flex-col gap-2">
                            <span className="w-full">
                                <label className="text-sm mb-2" htmlFor="name">Name</label>
                                <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Product Name" type="text" id='name' name="name" maxLength={50} defaultValue={product.name!} onChange={handleValueChange} required/>
                            </span>
                            <span className="w-full">
                                <label className="text-sm mb-2" htmlFor="description">Description</label>
                                <textarea className="p-2 pl-4 bg-peach rounded-xl overflow-hidden w-full" placeholder="Product Description" rows={3} id='description' name="description" maxLength={350} defaultValue={product.description!}  onChange={handleValueChange} required/>
                            </span>
                            <span className="w-full">
                                <label className="text-sm mb-2" htmlFor="tags">Search Tags</label>
                                <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Search Tags separated by a comma (eg. shops, ghana, orderly)"  defaultValue={product.tags?.join(', ') ?? ''}  maxLength={50} type="text" id='tags' name="tags" onChange={handleValueChange} required/>
                            </span>
                            <span className="w-full">
                                <label className="text-sm mb-2" htmlFor="variations">Variations</label>
                                <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Product Variations (eg. Small, Medium, Large )"  maxLength={50} defaultValue={product.variations?.join(', ')} type="text" id='variations' name="variations" onChange={handleValueChange} required/>
                            </span>
                            <span className="w-full flex items-baseline gap-2">
                                <small className="text-sm">GHS</small>
                                <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Price (GHS)" type="number" defaultValue={pesewasToCedis(product.price!)} pattern="^\d*(\.\d{0,2})?$" step='.01' max={1000000} min={1} id='price' name="price" onChange={handleValueChange} required/>
                            </span>                            
                            <span className="w-full"> 
                                <label className="bg-peach group rounded-xl hover:bg-darkRed flex w-full p-3 font-bold text-black hover:text-white duration-150 cursor-pointer justify-center items-center gap-3 mb-2" htmlFor="logo">
                                    Upload the product Image <FontAwesomeIcon icon={faUpload} />
                                </label>
                                <input className="p-2 pl-4 bg-peach rounded-full w-full hidden"   accept="image/*" type="file" multiple={false} id='logo' maxLength={30} onChange={(e)=>{handleImageChange(e.target.files![0])}} required/>
                                <p className="text-red font-medium text-center" style={{display: (submissionErr)? 'block': 'none' }}>File size is too large. Please upload files less than 500KB.<br />You can use <a href="https://tinypng.com/" className=" underline">tinyPNG</a> to reduce your file size.</p>
                            </span>
                            <span className="w-full flex flex-col md:flex-row gap-4">
                                <button className="rounded-full w-full" disabled={submitted || !valueChanged} onClick={(e)=>{e.preventDefault(); } } >
                                    <div style={{display: submitted  ? 'block' : 'none'}} id="loading"></div>
                                    <span style={{display: submitted ? 'none' : 'block'}} onClick={()=>{handleUpdateProduct()}}>Update Product</span>
                                </button>
                                <button className="rounded-full btn-secondary w-full" onClick={(e)=>{e.preventDefault(); router.back() } } >
                                    Cancel
                                </button>
                            </span>
                        </div>
                    </div>
                    <div className="bg-darkRed p-4 md:p-8 flex shadow-md md:shadow-none items-center justify-center">
                        <div className="bg-white text-black rounded-xl flex gap-4 flex-col p-4 md:p-8 w-full md:w-2/3 shadow-md">
                            <span className="w-full aspect-square rounded-xl border-2 border-gray-200 overflow-hidden flex justify-center items-center">
                                <img src={ productImageURL ? productImageURL : product.imageURL!} />
                            </span>
                            <h2 className="text-xl -mb-2">{updatedProduct.name ? updatedProduct.name : product.name}</h2>
                            <div className="w-full overflow-auto  -mb-2 flex flex-wrap gap-2">
                            {
                                ( updatedProduct.variations?.length != 0) && ( updatedProduct.variations?.at(0) != '' ) && updatedProduct.variations?.map((variation, idx) => {
                                return(
                                    <div className="bg-peach  whitespace-nowrap rounded-xl p-2" key={idx}>{variation}</div>
                                )}
                                )
                                
                            }
                            {
                                ( product.variations?.length != 0 && updatedProduct.variations == null ) && product.variations?.map((variation, idx) =>{
                                    return(
                                        <div className="bg-peach rounded-xl whitespace-nowrap p-2" key={idx}>{variation}</div>
                                    )}
                                    )
                            }
                            </div>

                            <span className="flex gap-1 items-baseline">
                                <small className="text-sm">GHS</small>
                                <h2 className="text-2xl mb-0 font-bold">{updatedProduct.price ? styledCedis(updatedProduct.price!) : styledCedis(product.price!)}</h2>
                            </span>
                        </div>
                    </div>

                </div>
            </section>
        </>
    )

    
}