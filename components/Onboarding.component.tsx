'use client'
import { copyToClipboard, fadePages, getBlobAndURLFromArrayBuffer, getCSV, getExtension } from "@/app/utils/frontend/utils";
import Link from "next/link";
import { useState, useRef, FormEvent, useEffect } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faShareFromSquare, faUpload } from "@fortawesome/free-solid-svg-icons";
import { clientSupabase } from "@/app/supabase/supabase-client";
import { TablesInsert } from "@/types/supabase";
import { v4 as uuidv4 } from 'uuid';
import { PostgrestSingleResponse, User } from "@supabase/supabase-js";
import { popupText } from "./Popup.component";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { CreateContact } from "@getbrevo/brevo/dist/model/createContact";
import { brevoApiResponse } from "@/models/notification.model";
import { supportedCountries } from "@/constants/country-codes"; 
import { findFlagUrlByIso3Code } from "country-flags-svg";
import Footer from "./Footer.component";
import { ShopCategories } from "@/constants/shop-categories";
import { POPUP_STATE } from "@/models/popup.enum";
import { usePostHog } from "posthog-js/react";
import { CreateCustomer } from "paystack-sdk/dist/customer/interface";
import { signedInUser } from "@/models/user.model";
import { getPaystack } from "@/app/utils/payments/paystack";

export default function OnboardingComponent({user}: {user: signedInUser}){ //Let's try to avoid prop drilling eh?

    const supabase = clientSupabase

    const captchaRef = useRef<HCaptcha>(null);
    const uploadLogoRef = useRef<HTMLLabelElement>(null)

    const [ shopLogo, setShopLogo ] = useState<File| Blob | null>(null)
    const [ shopLogoURL, setShopLogoURL ] = useState<string | null>(null)

    const [ newShop, setNewShop ] = useState<TablesInsert<'shops'>>({
        name: "",
        shopNameTag: "",
        imageURL: "",
        description: "",
        tags: [ShopCategories[0]],
        user_id: user.id,
        location: "",
        optionalPhone: "",
        optionalEmail: ""
    })

    const [ newShopLocation, setNewShopLocation ] = useState<TablesInsert<'locations'>>({
        buildingNum: "",
        streetAddress: "",
        region: "",
        country: "GHA"
    })

    const businessPhoneCountryCode = supportedCountries.find((country) => country.isoCode == newShopLocation.country)!.telephoneCode

    const [ uploadedFileExt, setFileExt ] = useState<string>('')

    const [ submitted, setSubmitted ] = useState<boolean>(false)
    const [ submissionErr, setSubErr] = useState<boolean>(false)
    const [ verified, setVerified   ] = useState<boolean>(false)
    const [ shopNameTagAllowed, setShopNameTagAllowed ] = useState<boolean>(true)

    const parent = useRef<HTMLDivElement|null>(null)
    const posthog = usePostHog()
    
    useEffect(() => {
        posthog.startSessionRecording()
    })

    function handleChangeQuestions(curr:string, next:string){
        fadePages(parent)
        setTimeout(() => {
            document.getElementById(curr)!.style.display = 'none'
            document.getElementById(next)!.style.display = 'flex'
            
        }, 250);
    }

    function toggleTag(tag:string){
            setNewShop( (prev) =>{
                return ({
                    ...prev,
                    tags: prev.tags!.includes(tag) ? prev.tags!.filter((existingTag) => existingTag != tag) : [tag]
                })
            })

    }

    function handleImageChange(file: File){
        setFileExt(getExtension(file.name)!)
        if(file.size > 2097152){
            setSubErr(true)
        }
        else {
            setSubErr(false)
            file.arrayBuffer().then((arrayBuffer) => {
                const {blob, imageUrl} = getBlobAndURLFromArrayBuffer(arrayBuffer,file)
                setShopLogo(blob)
                setShopLogoURL(imageUrl)
                console.log(imageUrl)
            })
        }
    }

    function handleGetLogo(e: FormEvent){
        e.preventDefault(); 
        if(shopLogoURL == null) {
            uploadLogoRef.current?.classList.add('bg-red', 'text-white')

            setTimeout(() => {
                uploadLogoRef.current?.classList.remove('bg-red', 'text-white')
            }, 300) // lol

            setTimeout(() => {
                uploadLogoRef.current?.classList.add('bg-red', 'text-white')
            }, 600)

            setTimeout(() => {
                uploadLogoRef.current?.classList.remove('bg-red', 'text-white')
            }, 900)
            console.log('1')
            return
        }
        console.log
        console.log('2')
        handleChangeQuestions('page1', 'page2') 
    }


    async function handleCreateShop(){
        setSubmitted(true)
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/db/location`, {
            method: 'POST',
            body: JSON.stringify(newShopLocation)
        })
        .then(res => res.json())
        .then(({data, error}: PostgrestSingleResponse<{id: string}[]>) => {
            if(error){
                console.log(error)
                popupText(`SB${error.code}: An error occurred.`, POPUP_STATE.FAILED)
                setSubmitted(false)
            } else {
                let shopLocationID = data[0].id 
                setNewShopLocation((prev) => {
                    return({
                        ...prev,
                        id: shopLocationID
                    })
                })

                supabase.storage
                .from("Orderly Shops")
                .upload(`public/shop-logo/${user!.id}.${uploadedFileExt}`, shopLogo!, {
                    cacheControl: '3600',
                    upsert: true
                }).then((data)=>{
                    let { data: {publicUrl}} = supabase.storage.from('Orderly Shops').getPublicUrl(data.data!.path)
                    
                    let date = new Date()
                    let shopID = uuidv4()
                    let insertObject: TablesInsert<'shops'> = {
                        ...newShop,
                        id: shopID,
                        createdAt: date.toISOString(),
                        imageURL: publicUrl,
                        location: shopLocationID,
                        updatedAt: date.toISOString()
                    }
                    console.log(insertObject)
                    supabase
                    .from('shops')
                    .insert(insertObject)
                    .then(({error}) => {
                        if(error){
                            console.log(error)
                            popupText(`SB${error.code}: An error occurred.`, POPUP_STATE.FAILED)
                            setSubmitted(false)
                        } else {
                            supabase
                            .from('user_metadata')
                            .update({
                                shop_id: shopID
                            })
                            .eq('id', user.id!)
                            .then(()=>{
                                const paystackCustomer:CreateCustomer = {
                                    first_name: user.firstName,
                                    last_name: user.lastName,
                                    email: user.email,
                                    metadata: {
                                        shop_id: shopID
                                    }
                                }

                                getPaystack().customer.create(paystackCustomer)
                                .then((res) => {
                                    if(res.status == false){
                                        popupText(`PS500: An error occurred when setting up your shop`, POPUP_STATE.FAILED)
                                        setSubmitted(false)
                                        throw new Error(`PS: ${res.message}`)
                                    }
                                    else {
                                        let brevoApiBody: CreateContact = {
                                            email: user.email,
                                            extId: user.id,
                                            updateEnabled: true,
                                            smsBlacklisted: false,
                                            attributes: {
                                                'shop': shopID
                                            }
                                        }
                        
                                        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/brevo/contact`, {
                                            method: 'POST',
                                            body: JSON.stringify(brevoApiBody)
                                        })
                                        .then(res => res.json())
                                        .then(({error}: brevoApiResponse) => {
                                            if(error != null){
                                                console.log(error)
                                                popupText(`BR${error.code}: An error occurred, please try again later`, POPUP_STATE.FAILED)
                                                setSubmitted(false)
                                            } else {
                                                handleChangeQuestions('page3', 'page4')
                                                setTimeout(() => {
                                                    setSubmitted(false)
                                                }, 250);
                                            }
                                        })
                                    }
                                })
                            })
                        }
                    })
                })
            }
        })
    }

    function handleValueChange(e: any){
        let field = e.target.name
        let value = e.target.value
        e.preventDefault()

        switch (field) {
            case 'shopBuildingNum':
            case 'shopStreetAddress':
            case 'shopCity':
            case 'shopRegion':
            case 'shopCountry':
                setNewShopLocation((prev) => {
                    return ({
                        ...prev,
                        [field]: value
                    })
                })
                break;

            case 'name':
            case 'description':
            case 'optionalEmail':
                setNewShop((prev) =>{
                    return ({
                        ...prev,
                        [field]: value
                    })
                })
                break;
            
            case 'optionalPhone':
                setNewShop((prev) =>{
                    return ({
                        ...prev,
                        [field]: value.startsWith('0') ? businessPhoneCountryCode + value.slice(1) : businessPhoneCountryCode + value
                    })
                })

            case 'shopNameTag':
                if(value == 'dashboard' || value == 'showdownshoes' || value == 'onboarding'){
                    setShopNameTagAllowed(false)
                    break;
                }

                clientSupabase
                .from('shops')
                .select('shopNameTag')
                .eq('shopNameTag', value)
                .then(({ data, error }) =>{
                    if(error){
                        console.log(error)
                        popupText(`SB${error.code}: An error occurred`, POPUP_STATE.FAILED)
                    } else {
                        if( data.length == 0 ){
                            setShopNameTagAllowed(true)
                            setNewShop((prev) =>{
                                return ({
                                    ...prev,
                                    shopNameTag: value.split('').filter((s:string) => s != ' ').join('').toLowerCase() // removeSpaces
                                })
                            })
                        } else {
                            setShopNameTagAllowed(false)
                            setNewShop((prev) =>{
                                return ({
                                    ...prev,
                                    shopNameTag: '' // reset
                                })
                            })
                        }
                    }
                })
                break;

            default:
                throw Error(`${field} field not implemented`)
        }
        console.log(newShop, newShopLocation)
    }


    return (
        <>
            <div className="m-auto w-[80%] min-h-[calc(100vh-50px-190px)] md:min-h-[calc(100vh-70px-122px)] mt-4 md:mt-6 mb-8 max-w-72 md:max-w-80 flex justify-center">
                <div ref={parent} className="flex flex-col items-center gap-4 w-80">
                    <form className="flex flex-col items-center gap-4 w-80" onSubmit={handleGetLogo} style={{display: 'flex'}} id='page1'>
                        <h1 className="text-2xl text-center font-bold">Let's set up your shop.</h1>
                        <p className="text-center">It just takes three steps!</p>
                        <span className="w-full flex flex-col gap-2">
                            <label className="text-sm" htmlFor="shopNameTag">Shop Name <span className="text-red">*</span></label>
                            <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="eg. Orderly Ghana" type="text" id='name' name="name" maxLength={50} onChange={handleValueChange} required/>
                        </span>
                        <span className="w-full flex flex-col gap-2">
                            <label className="text-sm" htmlFor="shopNameTag">Orderly Handle (no spaces)<span className="text-red">*</span></label>
                            <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="eg. orderlyghana" type="text" id='shopNameTag' pattern="[a-zA-Z0-9]+" name='shopNameTag' maxLength={50} onChange={handleValueChange} required/>
                            <span className="text-red font-medium text-sm" style={{display: (shopNameTagAllowed ? 'none' : 'block')}}>Name Tag already taken.</span>
                        </span>
                        <span className="w-full flex flex-col gap-1">
                            <label className="text-sm" htmlFor="shopCountry">Country <span className="text-red">*</span></label>
                            <span className="w-full relative">
                                <select id='shopCountry' className="p-2 pl-10 pr-4 bg-peach w-full rounded-full" name="shopCountry" onChange={handleValueChange} required>
                                    {
                                        supportedCountries.map((country, idx) => {
                                            return (
                                                <option className="flex bg-white hover:bg-gray-50 duration-150 p-2 items-center gap-2" key={idx} value={country.isoCode}>
                                                    <span className="ml-2">{country.name}</span>
                                                </option>
                                            )
                                        })
                                    }
                                </select>
                                <span className="absolute top-[0.6rem] left-4">
                                    <img className="w-[20px] h-[17px]" src={findFlagUrlByIso3Code(newShopLocation.country!)} />
                                </span>
                            </span>
                        </span>
                        <span className="w-full flex flex-col gap-2">
                            <label className="text-sm" htmlFor="optionalPhone">Business Phone Number <span className="text-red">*</span></label>
                            <span className="w-full relative">
                                <input className="p-2 pl-14 bg-peach rounded-full w-full" placeholder="207007007" type="text" id='optionalPhone' name="optionalPhone" pattern="[0-9].*" minLength={8} maxLength={13} onChange={handleValueChange} required/>
                                <span className="absolute top-2 left-3">+{businessPhoneCountryCode}</span>
                            </span>
                        </span>
                        <span className="w-full flex flex-col gap-2">
                            <label className="text-sm" htmlFor="optionalEmail">Business Email Address <span className="text-red">*</span></label>
                            <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder='support@orderlygh.shop' type="email" id='optionalEmail' name='optionalEmail' maxLength={30} onChange={handleValueChange} required/>
                        </span>
                        <span className="w-full"> 
                            { shopLogoURL && <>
                                <span className="w-16 h-16 m-auto border-2 border-gray-400 overflow-hidden flex items-center justify-center rounded-full">
                                        <img className="w-full" src={ shopLogoURL ?? ''}/>
                                </span>
                            </> 
                            }
                            <label className="bg-peach group rounded-xl hover:bg-darkRed flex w-full p-3 font-bold text-black hover:text-white duration-150 cursor-pointer justify-center items-center gap-3 my-4" ref={uploadLogoRef} htmlFor="logo">
                                Upload your shop logo <FontAwesomeIcon icon={faUpload} width={15} />
                            </label>
                            <input className="p-2 pl-4 bg-peach rounded-full w-full hidden"   accept="image/*" type="file" multiple={false} id='logo' name="logo" onChange={(e)=>{handleImageChange(e.target.files![0])}}/>
                            <p className="text-red font-medium text-center" style={{display: (submissionErr)? 'block': 'none' }}>File size is too large. Please upload files less than 2MB.<br />You can use <a href="https://tinypng.com/" className=" underline">tinyPNG</a> to reduce your file size.</p>
                        </span>
                        <HCaptcha
                            ref={captchaRef}
                            sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                            onVerify={() => setVerified(true)}
                        />
                        <span className="mb-4 w-full">
                            <button className="rounded-full w-full mb-2" disabled={submissionErr || !shopNameTagAllowed || !verified}>Set Up Shop</button>
                        </span>
                    </form>

                    <form className="flex flex-col items-center gap-4 w-80" onSubmit={(e)=>{e.preventDefault(); handleChangeQuestions('page2', 'page3') }} style={{display: 'none'}} id='page2'>
                        <h1 className="text-2xl text-center font-bold">Where is your business located?</h1>
                        <p className="mb-2 text-center">This information will be seen by your customers</p>
                        <span className="w-full flex flex-col gap-1">
                            <label className="text-sm" htmlFor="shopBuildingNum">Building Number</label>
                            <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="No. 8" type="string" id='shopBuildingNumber' name="shopBuildingNum" maxLength={20} onChange={handleValueChange}/>
                        </span>
                        <span className="w-full flex flex-col gap-1">
                            <label className="text-sm" htmlFor='shopStreetAddress'>Street Address <span className="text-red">*</span></label>
                            <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Freedom Avenue" type="string" id='shopStreetAddress' name='shopStreetAddress' maxLength={50} onChange={handleValueChange} required/>
                        </span>
                        <span className="w-full flex flex-col gap-1">
                            <label className="text-sm" htmlFor='shopCity'>City <span className="text-red">*</span></label>
                            <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Accra" type="string" id='shopCity' name='shopCity' maxLength={30} onChange={handleValueChange} required/>
                        </span>
                        <span className="w-full flex flex-col gap-1">
                            <label className="text-sm" htmlFor='shopRegion'>Region <span className="text-red">*</span></label>
                            <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Greater Accra" type="string" id='shopRegion' name='shopRegion' maxLength={30} onChange={handleValueChange} required/>
                        </span>
                        <span className="mb-4 w-full">
                            <button className="rounded-full w-full mb-2" >Save Location</button>
                            <button onClick={(e)=>{e.preventDefault(); handleChangeQuestions('page2', 'page1') }} className="btn-secondary rounded-full w-full mb-4">Go Back</button>
                        </span>
                    </form>

                    <form className="flex flex-col items-center gap-4 w-80" onSubmit={(e)=>{e.preventDefault(); handleCreateShop()}} style={{display: 'none'}} id='page3'>
                        <h1 className="text-2xl text-center font-bold">Your profile's looking good.</h1>
                        <p className="mb-2 text-center w-[95%]">Add a few more details to complete it!</p>
                        <div className="w-full flex mb-2 rounded-2xl bg-gray-100 p-4">
                            <div className="flex items-center gap-4">
                                <span className="w-16 h-16 border-2 border-gray-400 overflow-hidden flex items-center justify-center rounded-full">
                                        <img className="w-full" src={ shopLogoURL ?? ''}/>
                                </span>
                                <span className="w-[calc(100%-4rem)]flex flex-col gap-0">
                                    <h1 className="text-xl">{newShop.name}</h1>
                                    <h3 className="text-md font-semibold">@{newShop.shopNameTag}</h3>
                                </span>
                            </div>
                        </div>
                        <span className="w-full flex flex-col gap-2">
                            <label className="text-sm" htmlFor="description">Description <span className="text-red">*</span></label>
                            <textarea className="p-2 pl-4 bg-peach rounded-xl w-full" rows={3} placeholder={`What does your shop offer?`} id='description' name="description" maxLength={100} onChange={handleValueChange} />
                        </span>
                        <span className="w-full flex flex-col gap-2">
                            <label className="text-sm" htmlFor="tags">What category do you belong to? <span className="text-red">*</span></label>
                            <div className="flex flex-row gap-2 flex-wrap">
                                {
                                    ShopCategories.map((category, idx) => {
                                        return (
                                            <div onClick={()=>toggleTag(category)} key={idx} className={`px-4 py-2 rounded-full font-semibold ${ newShop.tags?.includes(category) ? 'bg-darkRed text-white' : 'bg-peach text-black'} cursor-pointer duration-150 text-xs`}>{category}</div>
                                        )
                                    })
                                }
                            </div>
                        </span>
                        <span className="mb-4 w-full">
                            <button className="rounded-full w-full mb-2" disabled={submitted} >
                                <div style={{display: submitted ? 'block' : 'none'}} id="loading"></div>
                                <span style={{display: submitted ? 'none' : 'block'}} >One more to go!</span>
                            </button>
                            <button onClick={(e)=>{e.preventDefault(); handleChangeQuestions('page3', 'page2') }} className="btn-secondary rounded-full w-full mb-4">Go Back</button>
                        </span>
                    </form>

                    <div className="flex flex-col items-center gap-4 w-80" style={{display: 'none'}} id='page4'>
                        <h1 className="text-2xl text-center font-bold">All done! What's next?</h1>
                        <p className="">Show orderly to the <span className="text-red group relative cursor-pointer">world!<span className="hidden group-hover:block -top-2 left-4  absolute pl-10"><span className="p-2 rounded-lg shadow hover:shadow-md duration-150 bg-white border-2 border-gray-50 text-gray-800 hover:text-red" onClick={()=>{copyToClipboard(`${process.env.NEXT_PUBLIC_BASE_URL}/s/${newShop.shopNameTag}`) ? popupText(`Your shop is live!\n You can share ${process.env.NEXT_PUBLIC_BASE_URL}/s/${newShop.shopNameTag} online!`, POPUP_STATE.SUCCESS) : null}}><FontAwesomeIcon width={12} icon={faShareFromSquare} /></span></span></span></p>
                        <div className="flex flex-col mb-4 text-center gap-3 p-8 bg-peach rounded-xl shadow-sm w-80">
                            <h3 className="font-bold text-xl">You can do all this - and more - with Orderly!</h3>
                            <p>Take client orders</p>
                            <p>Manage order fulfillment</p>
                            <p>Showcase your products</p>
                            <p>Manage your inventory</p>
                        </div>
                        <span className="mb-4 w-full">
                            <Link href={`/s/dashboard`} prefetch={false}><button className="rounded-full w-full mb-2" >Access Your Dashboard</button></Link>
                        </span>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}