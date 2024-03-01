'use client'
import { IOTPPayload } from "@/models/otp.model";
import { copyToClipboard, fadePages, getBlobAndURLFromArrayBuffer, getCSV, getExtension, getLocalShop } from "@/app/utils/frontend/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink, faShareFromSquare, faUpload } from "@fortawesome/free-solid-svg-icons";
import { OrderlyPlans } from "@/constants/orderlyPlans.constant";
import { IPlan } from "@/models/plans.model";
import { clientSupabase } from "@/app/supabase/supabase-client";
import { Tables, TablesInsert } from "@/types/supabase";
import { v4 as uuidv4 } from 'uuid';
import { PostgrestSingleResponse, User } from "@supabase/supabase-js";
import { popupText } from "./Popup.component";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { CreateContact } from "@getbrevo/brevo/dist/model/createContact";
import { brevoApiResponse } from "@/models/notification.model";
import { supportedCountries } from "@/constants/country-codes"; 
import { findFlagUrlByIso3Code } from "country-flags-svg";
import OtpInput from 'react-otp-input';

export default function OnboardingComponent({user}: {user: User}){ //Let's try to avoid prop drilling eh?
//export default function OnboardingComponent(){
    const router = useRouter()
    const searchParams = useSearchParams()
    let destination = searchParams.get('to')

    const supabase = clientSupabase

    const captchaRef = useRef<HCaptcha>(null);
    const [ shopLogo, setShopLogo ] = useState<File| Blob | null>(null)
    const [ shopLogoURL, setShopLogoURL ] = useState<string | null>(null)

    const [ newUser, setNewUser ] = useState<TablesInsert<'user_metadata'>>({
        id: user.id,
        firstName: "",
        lastName: "",
        isOrderly: false,
        phoneNumber: ""
    })

    const [ unverifiedPhoneNumber, setUnverifiedPhone ] = useState<string>('')

    const [ newShop, setNewShop ] = useState<TablesInsert<'shops'>>({
        name: "",
        shopNameTag: "",
        imageURL: "",
        description: "",
        tags: [],
        user_id: user.id,
        location: "",
        optionalPhone: "",
        optionalEmail: ""
    })

    const [ newLocation, setNewLocation ] = useState<TablesInsert<'locations'>>({
        buildingNum: "",
        streetAddress: "",
        region: "",
        country: "GHA"
    })

    const [ newShopLocation, setNewShopLocation ] = useState<TablesInsert<'locations'>>({
        buildingNum: "",
        streetAddress: "",
        region: "",
        country: "GHA"
    })

    const phoneCountryCode = supportedCountries.find((country) => country.isoCode == newLocation.country)!.telephoneCode
    const businessPhoneCountryCode = supportedCountries.find((country) => country.isoCode == newShopLocation.country)!.telephoneCode

    const [ uploadedFileExt, setFileExt ] = useState<string>('')

    const [ submitted, setSubmitted ] = useState<boolean>(false)
    const [ submissionErr, setSubErr] = useState<boolean>(false)
    const [ verified, setVerified   ] = useState<boolean>(false)
    const [ shopNameTagAllowed, setShopNameTagAllowed ] = useState<boolean>(true)

    const [ OTP, setOTP ] = useState<string>('')

    const [ sentOTPSuccess, setSentOTPSuccess ] = useState<boolean | null>(null)
    const [ OTPMessage, setOTPMessage ] = useState<string>('')

    const [ OTPVerifySuccess ,setOTPVerifySuccess ] =  useState<boolean | null>(null)
    const [ OTPVerifySuccessMessage ,setOTPVerifySuccessMessage ] =  useState<string | null>(null)

    const orderlyRef = useRef<HTMLSpanElement>(null)
    const notOrderlyRef = useRef<HTMLSpanElement>(null)
    
    const parent = useRef<HTMLDivElement|null>(null)

    const [ isPayingAnnually, setPayingAnnually ] = useState<boolean>(true)
    const [ selectedPlan, setSelectedPlan ] = useState<IPlan | null>(null)

    function handleChangeQuestions(curr:string, next:string){
        fadePages(parent)
        setTimeout(() => {
            document.getElementById(curr)!.style.display = 'none'
            document.getElementById(next)!.style.display = 'flex'
            
        }, 250);
    }

    function generateOTP(){
        setSubmitted(true)

        let number: string = unverifiedPhoneNumber.startsWith('0') ? phoneCountryCode + unverifiedPhoneNumber.slice(1) : phoneCountryCode + unverifiedPhoneNumber

        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notify/phone/generate-otp`, {
            method: 'POST',
            body: JSON.stringify({
                number: number
            })
        })
        .then((res)=>res.json())
        .then((data: IOTPPayload)=>{
            console.log(data.code)
            if (data.code === '1000'){
                setSentOTPSuccess(true)
                setOTPMessage(`We've sent you a One Time Password! Check your messages or dial ${data.ussd_code} to get your code`)
            } else {
                setSentOTPSuccess(false)
            }

            handleChangeQuestions('page1','page2')
            setSubmitted(false)
        })
        .catch((error)=>{
            setSentOTPSuccess(false)
            handleChangeQuestions('page1','page2')
            console.log(error)
            setSubmitted(false)
        })
    }

    function verifyOTP() {
        setSubmitted(true)

        let number: string = unverifiedPhoneNumber.startsWith('0') ? phoneCountryCode + unverifiedPhoneNumber.slice(1) : phoneCountryCode + unverifiedPhoneNumber

        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}`, {
            method: 'POST',
            body: JSON.stringify({
                number: number,
                otp: OTP
            })
        })
        .then((res) => res.json())
        .then((data) =>{
            if(data.code == '1100'){
                setOTPVerifySuccess(true)
                setNewUser((prev) => {
                    return ({
                        ...prev,
                        phoneNumber: unverifiedPhoneNumber
                    })
                })
                handleUpdateUserWithBasicInfo()
            } else {
                setOTPVerifySuccessMessage("You've entered the wrong OTP code. Please verify and try again.")
                setOTPVerifySuccess(false)
                setSubmitted(false)
            }
        })
        .catch((error) =>{
            console.log(error)
            setOTPVerifySuccessMessage("We've encountered an error. Please try again later.")
            setOTPVerifySuccess(false)
            setSubmitted(false)
        })
    }

    function handleIsOrderlyChoice(selector: string){
        switch(selector){
            case 'orderly':
                orderlyRef.current!.style.borderColor = 'var(--darkRed)'
                orderlyRef.current!.style.backgroundColor = 'var(--red)'
                orderlyRef.current!.style.color = 'white'
                notOrderlyRef.current!.style.borderColor = 'transparent'
                notOrderlyRef.current!.style.backgroundColor = 'rgb(229, 231, 235)'
                notOrderlyRef.current!.style.color = 'var(--darkRed)'

                setNewUser((prev) =>{
                    return ({
                        ...prev,
                        isOrderly: true
                    })
                })
                
                break;

            case 'notOrderly':
                orderlyRef.current!.style.borderColor = 'transparent'
                orderlyRef.current!.style.backgroundColor = 'rgb(229, 231, 235)'
                orderlyRef.current!.style.color = 'var(--darkRed)'
                notOrderlyRef.current!.style.borderColor = 'var(--darkRed)'
                notOrderlyRef.current!.style.backgroundColor = 'var(--red)'
                notOrderlyRef.current!.style.color = 'white'
                
                setNewUser((prev) =>{
                    return ({
                        ...prev,
                        isOrderly: false
                    })
                })
                
                break;
        }
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

    async function handleUpdateUserWithBasicInfo(){
        //console.log(newUser, unverifiedPhoneNumber)
        let insertObject:TablesInsert<'user_metadata'> = {
            ...newUser,
            email: user.email,
            phoneNumber: unverifiedPhoneNumber
        }
        
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/db/user`, {
            method: 'POST',
            body: JSON.stringify(insertObject)
        })
        .then(res => res.json())
        .then(({data, error}:PostgrestSingleResponse<{id: string}[]>) => {
            if(error){
                console.log(error)
                popupText(`SB${error.code}: An error occurred`)
            } else{
                if(data[0].id != newUser.id){
                    throw('ids in users table and user_metadata table are not equal')
                } else {
                    handleChangeQuestions('page3', 'page4')
                    setTimeout(() => {
                        setSubmitted(false)
                    }, 250);
                }
            }
        })
    }

    async function handleUpdateUserWithOrderlyStatAndLocation(){
        setSubmitted(true)
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/db/location`, {
            method: 'POST',
            body: JSON.stringify(newLocation)
        })
        .then(res => res.json())
        .then(({data, error}: PostgrestSingleResponse<{id: string}[]>) => {
            if(error){
                console.log(error)
                popupText(`SB${error.code}: An error occurred.`)
                setSubmitted(false)
            } else {
                setNewLocation((prev) => {
                    return({
                        ...prev,
                        id: data[0].id
                    })
                })
                fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/db/user`, {
                    method: 'UPDATE',
                    body: JSON.stringify({
                        id: newUser.id!,
                        location: data[0].id
                    })
                })
                .then(res => res.json())
                .then(({error} :PostgrestSingleResponse<null>) => {
                    if(error){
                        console.log(error)
                        popupText(`SB${error.code}: An error occurred.`)
                        setSubmitted(false)
                    } else {

                        let brevoApiBody: CreateContact = {
                            email: user.email,
                            extId: user.id,
                            updateEnabled: true,
                            smsBlacklisted: false,
                            attributes: {
                                'isOrderly': newUser.isOrderly
                            }
                        }
    
                        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/brevo/contact`, {
                            method: 'POST',
                            body: JSON.stringify(brevoApiBody)
                        })
                        .then(res => res.json())
                        .then(({data, error}: brevoApiResponse) => {
                            if(error != null){
                                console.log(error)
                                popupText(`BR${error.code}: An error occurred, please try again later`)
                                setSubmitted(false)
                            } else {
                                handleChangeQuestions('page3', 'page4')
                                setTimeout(() => {
                                    setSubmitted(false)
                                }, 250)
                            }
                        })
                    }
                })
            }
        })
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
                popupText(`SB${error.code}: An error occurred.`)
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
                            popupText(`SB${error.code}: An error occurred.`)
                            setSubmitted(false)
                        } else {
                            supabase
                            .from('user_metadata')
                            .update({
                                shop_id: shopID
                            })
                            .eq('id', newUser.id!)
                            .then(()=>{
                                handleChangeQuestions('page7', 'page8')
                                setTimeout(() => {
                                    setSubmitted(false)
                                }, 250);
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
            case 'firstName':
            case 'lastName':
                setNewUser((prev) => {
                    return ({
                        ...prev,
                        [field]: value
                    })
                })
                break;
            
            case 'buildingNum':
            case 'streetAddress':
            case 'city':
            case 'region':
            case 'country':
                setNewLocation((prev) => {
                    return ({
                        ...prev,
                        [field]: value
                    })
                })
                break;

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
                clientSupabase
                .from('shops')
                .select('shopNameTag')
                .eq('shopNameTag', value)
                .then(({ data, error }) =>{
                    if(error){
                        console.log(error)
                        popupText(`SB${error.code}: An error occurred`)
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

            case 'tags':
                setNewShop((prev) =>{
                    return ({
                        ...prev,
                        tags: getCSV(value).slice(0,4)
                    })
                })
                break;

            default:
                throw Error(`${field} field not implemented`)
        }
        console.log(newShop, newUser, newShopLocation ,newLocation)
    }

    useEffect(()=>{
        handleIsOrderlyChoice('orderly')
    },[router])

    return (
        <>
            <div className="m-auto w-[80%]  md:mt-8 lg:mt-15 max-w-72 md:max-w-80 flex justify-center">
                <div ref={parent} className="flex flex-col items-center gap-4 w-80 ">
                    <h6>Ready to get orderly?</h6>
                    <form className="flex flex-col items-center gap-4" onSubmit={(e)=>{e.preventDefault(); generateOTP()}} style={{display: 'flex'}} id='page1'>
                        <h1 className="text-3xl text-center font-bold">Let's get to know you!</h1>
                        <span className="w-full flex flex-col gap-2">
                            <label className="text-sm" htmlFor="firstName">First Name <span className="text-red">*</span></label>
                            <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Kwaku" type="text" id='firstName' name="firstName" minLength={1} maxLength={30} onChange={handleValueChange} required/>
                        </span>
                        <span className="w-full flex flex-col gap-2">
                            <label className="text-sm" htmlFor="lastName">Last Name <span className="text-red">*</span></label>
                            <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Ananse" type="text" id='lastName' name="lastName" onChange={handleValueChange} minLength={1} maxLength={50} required/>
                        </span>
                        <span className="w-full flex flex-col gap-2">
                            <label className="text-sm" htmlFor="country">Country <span className="text-red">*</span></label>
                            <span className="w-full relative">
                                <select id='country' className="p-2 pl-10 pr-4 bg-peach w-full rounded-full" name="country" onChange={handleValueChange} required>
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
                                    <img className="w-[20px] h-[17px]" src={findFlagUrlByIso3Code(newLocation.country!)} />
                                </span>
                            </span>
                        </span>
                        <span className="w-full flex flex-col gap-2">
                            <label className="text-sm" htmlFor="phoneNumber">Phone Number <span className="text-red">*</span></label>
                            <span className="w-full relative">
                                <input className="p-2 pl-14 bg-peach rounded-full w-full mb-4" placeholder="207007007" type="text" id='phoneNumber' pattern="[0-9].*" minLength={8} maxLength={13} onChange={(e)=>{setUnverifiedPhone(e.target.value)}} required/>
                                <span className="absolute top-2 left-3">+{phoneCountryCode}</span>
                            </span>
                        </span>
                        <HCaptcha
                            ref={captchaRef}
                            sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                            onVerify={() => setVerified(true)}
                        />
                        <button className="rounded-full w-full mb-4" disabled={!verified || submitted}>
                            <div style={{display: submitted ? 'block' : 'none'}} id="loading"></div>
                            <span style={{display: submitted ? 'none' : 'block'}} >Let's Go!</span>
                        </button>
                    </form>
                    <form className="flex flex-col items-center gap-4" onSubmit={(e)=>{e.preventDefault(); verifyOTP() }} style={{display: 'none'}} id='page2'>
                        { sentOTPSuccess /* If the OTP was sent successfully */ && <>
                            <h1 className="text-3xl text-center font-bold">Verify your phone number!</h1>
                            <p className="mb-2 text-center">{OTPMessage}</p>
                            <span className="w-full flex flex-col gap-2 justify-center">
                                <label className="text-sm text-center" htmlFor="otp">OTP Code</label>
                                {/*
                                    <input className="p-2 pl-4 bg-peach rounded-full w-full mb-4" placeholder="123456" type="text" id='otp' name="otp" pattern="[0-9].*" minLength={6} maxLength={6} onChange={(e)=>{setOTP(e.target.value)}} required/>
                                    */
                                }
                                <div className="w-fit m-auto mt-3 mb-4">
                                    <OtpInput
                                        value={OTP}
                                        onChange={setOTP}
                                        numInputs={6}
                                        placeholder="123456"
                                        renderSeparator={<span className="px-2 font-bold text-gray-400">-</span>}
                                        renderInput={(props) => <input {...props} className="py-4 px-4 !w-[1.7em] text-4xl rounded-lg font-semibold border-[3px] border-gray-400"/>}
                                    />
                                </div>

                            </span>
                            <span className="mb-4 w-full">
                                <button className="rounded-full w-full" disabled={submitted || !verified} >
                                    <div style={{display: submitted ? 'block' : 'none'}} id="loading"></div>
                                    <span style={{display: submitted ? 'none' : 'block'}} >Verify Your OTP</span>
                                </button>
                            </span>
                            <p className="font-bold text-red text-center" style={{display: (OTPVerifySuccess !== null) ? ( (OTPVerifySuccess) ? 'None': 'Block') : 'None' }}>{OTPVerifySuccessMessage}</p>
                        </>
                        }

                        { !sentOTPSuccess && 
                            <>
                                <h1 className="text-3xl text-center font-bold text-red">Oh no!</h1>
                                <p className="mb-4 text-center">We've encountered an error while trying to send you a verification code.<br />Please try again in five minutes</p>
                                <button onClick={(e)=>{e.preventDefault(); handleChangeQuestions('page2', 'page1') }} className="btn-secondary rounded-full w-full mb-4">Go Back</button>    
                            </>
                        }

                    </form>

                    <form className="flex flex-col items-center gap-4 w-80" onSubmit={(e)=>{e.preventDefault(); handleUpdateUserWithOrderlyStatAndLocation()} } style={{display: 'none'}} id='page3'>
                        <h1 className="text-3xl text-center font-bold">What's your home/office location?</h1>
                        <p className="text-center">We'll save this for future deliveries</p>
                        <span className="w-full flex flex-col gap-1">
                            <label className="text-sm" htmlFor="buildingNum">Apt. Number/House Number</label>
                            <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="8" type="text" id='buildingNum' name="buildingNum" maxLength={20} onChange={handleValueChange}/>
                        </span>
                        <span className="w-full flex flex-col gap-1">
                            <label className="text-sm" htmlFor="streetAddress">Street Address <span className="text-red">*</span></label>
                            <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Freedom Avenue" type="text" id='streetAddress' name="streetAddress" maxLength={50} onChange={handleValueChange} required/>
                        </span>
                        <span className="w-full flex flex-col gap-1">
                            <label className="text-sm" htmlFor="city">City <span className="text-red">*</span></label>
                            <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Accra" type="text" id='city' name="city" maxLength={30} onChange={handleValueChange} required/>
                        </span>
                        <span className="w-full flex flex-col gap-1">
                            <label className="text-sm" htmlFor="region">Region <span className="text-red">*</span></label>
                            <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Greater Accra" type="text" id='region' name="region" maxLength={30} onChange={handleValueChange} required/>
                        </span>
                        <span className="w-full flex flex-col gap-2">
                            <label className="text-sm" htmlFor="country">Country <span className="text-red">*</span></label>
                            <span className="w-full relative">
                                <select id='country' className="p-2 pl-10 pr-4 bg-peach w-full rounded-full" name="country" onChange={handleValueChange} required>
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
                                    <img className="w-[20px] h-[17px]" src={findFlagUrlByIso3Code(newLocation.country!)} />
                                </span>
                            </span>
                        </span>
                        <span className="mb-4 w-full">
                            <button className="rounded-full w-full mb-2" disabled={submitted} >
                                <div style={{display: submitted ? 'block' : 'none'}} id="loading"></div>
                                <span style={{display: submitted ? 'none' : 'block'}} >Save Location</span>
                            </button>
                            <button onClick={(e)=>{e.preventDefault(); handleChangeQuestions('page3', 'page2') }} className="btn-secondary rounded-full w-full mb-4">Go Back</button>
                        </span>
                    </form>

                    <div className="flex flex-col items-center gap-4 w-72" style={{display: 'none'}} id='page4'>
                        <h1 className="text-3xl text-center font-bold mb-4">I am a..</h1>
                        <div className="mb-8">
                            <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                                <span className="group w-full duration-150 md:w-[300px] border-[3px] border-transparent cursor-pointer h-12 md:h-72 flex flex-col-reverse gap-8 p-8 bg-red hover:bg-darkRed rounded-xl" ref={orderlyRef} onClick={()=>{handleIsOrderlyChoice('orderly')}}>
                                    <img src="/img/shop_owner_option.svg" width={150} />
                                    <h2 className="text-center text-3xl">A Shop Owner</h2>
                                </span>
                                <span className="group w-full md:w-[300px] duration-150 border-[3px] border-transparent cursor-pointer h-12 md:h-72 p-8  flex flex-col-reverse gap-8 bg-gray-200 hover:bg-darkRed rounded-xl" ref={notOrderlyRef} onClick={()=>{handleIsOrderlyChoice('notOrderly')}}>
                                    <img src="/img/shopper_option.svg" width={150} />
                                    <h2 className="text-3xl text-center">A Shopper</h2>
                                </span>
                            </div>
                        </div>
                        <button onClick={(e)=>{e.preventDefault(); handleChangeQuestions('page4', 'page5')}} className="rounded-full w-full mb-4">Next &rarr;</button>
                    </div>

                    { !newUser.isOrderly &&  // Shopper View
                        <>
                            <div className="flex flex-col items-center gap-4 w-72" style={{display: 'none'}} id='page5'>
                                <h1 className="text-3xl text-center font-bold">All done, {newUser.firstName}.</h1>
                                <p className="mb-4">Welcome to Orderly!</p>
                                <span className="mb-4 w-full">
                                    <a href={`/${destination || `s/${getLocalShop()}/`}`}><button className="rounded-full w-full mb-2" >Let's Go!</button></a>
                                </span>
                            </div>
                        </>
                    }

                    { newUser.isOrderly &&  // Shop Owner View
                        <>
                            <form className="flex flex-col items-center gap-4 w-72" onSubmit={(e)=>{e.preventDefault(); handleChangeQuestions('page5', 'page6') }} style={{display: 'none'}} id='page5'>
                                <h1 className="text-3xl text-center font-bold">Let's set up your shop.</h1>
                                <p className="text-center">This step just takes a minute!</p>
                                <span className="w-full flex flex-col gap-2">
                                    <label className="text-sm" htmlFor="shopNameTag">Full name <span className="text-red">*</span></label>
                                    <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="eg. Orderly Ghana" type="text" id='name' name="name" maxLength={50} onChange={handleValueChange} required/>
                                </span>
                                <span className="w-full flex flex-col gap-2">
                                    <label className="text-sm" htmlFor="shopNameTag">Name Tag (without spaces) <span className="text-red">*</span></label>
                                    <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="eg. orderlyghana" type="text" id='shopNameTag' name='shopNameTag' maxLength={50} onChange={handleValueChange} required/>
                                    <span className="text-red font-medium text-sm" style={{display: (shopNameTagAllowed ? 'none' : 'block')}}>Name Tag already taken.</span>
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
                                    <label className="bg-peach group rounded-xl hover:bg-darkRed flex w-full p-3 font-bold text-black hover:text-white duration-150 cursor-pointer justify-center items-center gap-3 my-4" htmlFor="logo">
                                        Upload your shop logo <FontAwesomeIcon icon={faUpload} />
                                    </label>
                                    <input className="p-2 pl-4 bg-peach rounded-full w-full hidden"   accept="image/*" type="file" multiple={false} id='logo' onChange={(e)=>{handleImageChange(e.target.files![0])}} required/>
                                    <p className="text-red font-medium text-center" style={{display: (submissionErr)? 'block': 'none' }}>File size is too large. Please upload files less than 2MB.<br />You can use <a href="https://tinypng.com/" className=" underline">tinyPNG</a> to reduce your file size.</p>
                                </span>
                                <span className="mb-4 w-full">
                                    <button className="rounded-full w-full mb-2" disabled={submissionErr || !shopNameTagAllowed}>Set Up Shop</button>
                                    <button onClick={(e)=>{e.preventDefault(); handleChangeQuestions('page5', 'page4') }} className="btn-secondary rounded-full w-full mb-4">Go Back</button>
                                </span>
                            </form>

                            <form className="flex flex-col items-center gap-4 w-80" onSubmit={(e)=>{e.preventDefault(); handleUpdateUserWithOrderlyStatAndLocation() }} style={{display: 'none'}} id='page6'>
                                <h1 className="text-3xl text-center font-bold">Where is your business located?</h1>
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
                                            <img className="w-[20px] h-[17px]" src={findFlagUrlByIso3Code(newLocation.country!)} />
                                        </span>
                                    </span>
                                </span>
                                <span className="mb-4 w-full">
                                    <button className="rounded-full w-full mb-2" >Save Location</button>
                                    <button onClick={(e)=>{e.preventDefault(); handleChangeQuestions('page6', 'page5') }} className="btn-secondary rounded-full w-full mb-4">Go Back</button>
                                </span>
                            </form>

                            <form className="flex flex-col items-center gap-4 w-80" onSubmit={(e)=>{e.preventDefault(); handleCreateShop()}} style={{display: 'none'}} id='page7'>
                                <h1 className="text-3xl text-center font-bold">Your profile's looking good.</h1>
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
                                    <textarea className="p-2 pl-4 bg-peach rounded-xl w-full" rows={3} placeholder={`Why ${newShop.name}? What do you offer?`} id='description' name="description" maxLength={100} onChange={handleValueChange} />
                                </span>
                                <span className="w-full flex flex-col gap-2">
                                    <label className="text-sm" htmlFor="tags">Descriptive tags separated by commas <span className="text-red">*</span></label>
                                    <input className="p-2 pl-4 bg-peach rounded-full w-full mb-2" placeholder="(eg. shoes, ghana, nike)" type="text" id='tags' name="tags" maxLength={70} onChange={handleValueChange} required />
                                </span>
                                <span className="mb-4 w-full">
                                    <button className="rounded-full w-full mb-2" disabled={submitted} >
                                        <div style={{display: submitted ? 'block' : 'none'}} id="loading"></div>
                                        <span style={{display: submitted ? 'none' : 'block'}} >One more to go!</span>
                                    </button>
                                    <button onClick={(e)=>{e.preventDefault(); handleChangeQuestions('page7', 'page6') }} className="btn-secondary rounded-full w-full mb-4">Go Back</button>
                                </span>
                            </form>

                            <div className="flex flex-col items-center gap-4 w-80" style={{display: 'none'}} id='page8'>
                                <h1 className="text-3xl text-center font-bold">All done, {( newUser.firstName ) ?? "What's next?" }</h1>
                                <p className="">Show orderly to the <span className="text-red group relative cursor-pointer">world!<span className="hidden group-hover:block -top-2 left-4  absolute pl-10"><span className="p-2 rounded-lg shadow hover:shadow-md duration-150 bg-white border-2 border-gray-50 text-gray-800 hover:text-red" onClick={()=>{copyToClipboard(`${process.env.NEXT_PUBLIC_BASE_URL}/s/${newShop.shopNameTag}`) ? popupText(`Your shop is live!\n You can share ${process.env.NEXT_PUBLIC_BASE_URL}/s/${newShop.shopNameTag} online!`) : null}}><FontAwesomeIcon icon={faShareFromSquare} /></span></span></span></p>
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
                        </>
                    }
                </div>
            </div>
        </>
    )
}