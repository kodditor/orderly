'use client'
import { IOTPPayload } from "@/models/otp.model";
import { fadePages, getBlobAndURLFromArrayBuffer, getCSV, getExtension } from "@/app/utils/frontend/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { OrderlyPlans } from "@/constants/orderlyPlans.constant";
import { IPlan } from "@/models/plans.model";
import { clientSupabase } from "@/app/supabase/supabase-client";
import { Tables } from "@/types/supabase";
import { v4 as uuidv4 } from 'uuid';
import { User } from "@supabase/supabase-js";

export default function OnboardingComponent({user}: {user: User}){ //Let's try to avoid prop drilling eh?

    const router = useRouter()
    const searchParams = useSearchParams()
    let destination = searchParams.get('to')

    const supabase = clientSupabase

    const [ firstName, setFirst ] = useState<string|null>(null)
    const [ lastName, setLast ] = useState<string>('')

    const [ shopName, setShopName ] = useState<string>('')
    const [ shopNameTag, setShopNameTag ] = useState<string>('')
    const [ shopLogo, setShopLogo ] = useState<File| Blob | null>(null)
    const [ shopLogoURL, setShopLogoURL ] = useState<string | null>(null)
    const [ shopDesc, setShopDesc ] = useState<string>('')
    const [ shopTags, setShopTags ] = useState<string[]>([])

    const [ uploadedFileExt, setFileExt ] = useState<string>('')

    const [ aptNum, setAptNum ] = useState<string>('')
    const [ streetAddress, setStreetAddress ] = useState<string>('')
    const [ city, setCity ] = useState<string>('')
    const [ region, setRegion ] = useState<string>('')
    const [ country, setCountry ] = useState<string>('')

    const [ phoneNumber, setPhone ] = useState<string>('')
    const [ isOrderly, setIsOrderly ] = useState<boolean>(false) // Shop user or customer
    let isOrderlyTemp: boolean| null = null // Because setIsOrderly is slow, so we'll consolidate the two on final page submit

    const [ submitted, setSubmitted ] = useState<boolean>(false)
    const [ submissionErr, setSubErr] = useState<boolean>(false)

    const [ OTP, setOTP ] = useState<string>('')

    const [ sentOTPSuccess, setSentOTPSuccess ] = useState<boolean | null>(null)
    const [ OTPMessage, setOTPMessage ] = useState<string>('')

    const [ OTPVerifySuccess ,setOTPVerifySuccess ] =  useState<boolean | null>(null)
    const [ OTPVerifySuccessMessage ,setOTPVerifySuccessMessage ] =  useState<string | null>(null)

    const orderlyRef = useRef<HTMLSpanElement>(null)
    const notOrderlyRef = useRef<HTMLSpanElement>(null)
    
    const parent = useRef<HTMLDivElement|null>(null)
    const planSelectorDialog = useRef<HTMLDialogElement|null>(null)

    const [ isPayingAnnually, setPayingAnnually ] = useState<boolean>(true)
    const [ selectedPlan, setSelectedPlan ] = useState<IPlan | null>(null)

    function handleChangeQuestions(curr:string, next:string){
        fadePages(parent)
        setTimeout(() => {
            document.getElementById(curr)!.style.display = 'none'
            document.getElementById(next)!.style.display = 'flex'
            
        }, 250);

    }

    async function generateOTP(){
        //setSubmitted(true)
        
        handleChangeQuestions('page2', 'page4') // Remember to remove!
        return

        let number = `233${phoneNumber.slice(1)}`

        fetch('https://sms.arkesel.com/api/otp/generate',
        {
            method: 'POST',
            headers: {
                'api-key': process.env.NEXT_PUBLIC_ARKESEL_API_KEY!,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                expiry: 5,
                length: 6,
                medium: 'sms',
                number: number,
                message: "Ready to get orderly?\nHere's your Orderly OTP code: %otp_code%\n\nIt's a secret! Do not share this with anyone.",
                sender_id: 'Orderly GH',
                type: 'numeric',
            })
        })
        .then((res)=>res.json())
        .then((data: IOTPPayload)=>{
            if (data.code === '1000'){
                setSentOTPSuccess(true)
                setOTPMessage(`We've sent you a OTP! Check your messages or dial ${data.ussd_code} to get your code`)
            } else {
                setSentOTPSuccess(false)
            }

            handleChangeQuestions('page2','page3')
            setSubmitted(false)

        })
        .catch((error)=>{
            setSentOTPSuccess(false)
            handleChangeQuestions('page2','page3')
            console.log(error)
            setSubmitted(false)
        })



    }

    async function verifyOTP() {
        setSubmitted(true)
        fetch('https://sms.arkesel.com/api/otp/verify',{
            headers: {
                'api-key': process.env.NEXT_PUBLIC_ARKESEL_API_KEY!,
                'content-type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                code: OTP,
                number: `233${phoneNumber.slice(1)}`
            })
        })
        .then((res) => res.json())
        .then((data) =>{
            if(data.code == '1100'){
                setOTPVerifySuccess(true)
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
                notOrderlyRef.current!.style.borderColor = 'transparent'
                isOrderlyTemp = true
                break;

            case 'notOrderly':
                orderlyRef.current!.style.borderColor = 'transparent'
                notOrderlyRef.current!.style.borderColor = 'var(--darkRed)'
                isOrderlyTemp = false
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

    function showPaymentPlan(plan: IPlan){
        setSelectedPlan(plan)
        planSelectorDialog.current!.showModal()
    }

    async function handleUpdateUserWithBasicInfo(){

        supabase.auth.updateUser({
            data: {
                firstName: firstName,
                lastName: lastName,
                phoneNumber: phoneNumber
            }
        }).then((data)=>{
            console.log(data.data.user!.user_metadata)
            handleChangeQuestions('page3', 'page4')
            setTimeout(() => {
                setSubmitted(false)
             }, 250);
        })
    }

    async function handleUpdateUserWithOrderlyStatAndLocation(){
        setSubmitted(false)
        if( (streetAddress !== '') && (city !== '')){
            supabase.auth.updateUser({
                data: {
                    isOrderly: isOrderlyTemp,
                    locationExists: true,
                    location: {
                        aptNum: aptNum,
                        streetAddress: streetAddress,
                        city: city,
                        region: region,
                        country: country
                    }
                }
            }).then((data)=>{
                console.log(data.data.user?.user_metadata)
                handleChangeQuestions('page5c', 'page6c')
                setTimeout(() => {
                    setSubmitted(false)
                 }, 250);
            })
        } else {
            supabase.auth.updateUser({
                data: {
                    isOrderly: isOrderlyTemp,
                    locationExists: false,
                }
            }).then((data)=>{
                console.log(data.data.user?.user_metadata)
                handleChangeQuestions('page5c', 'page6c')
                setTimeout(() => {
                    setSubmitted(false)
                 }, 250);
            })
        }
    }

    async function handleCreateShop(){
        setSubmitted(true)
        supabase.storage
        .from("Orderly Shops")
        .upload(`public/shop-logo/${user!.id}.${uploadedFileExt}`, shopLogo!, {
            cacheControl: '3600',
            upsert: true
        }).then((data)=>{
            let { data: {publicUrl}} = supabase.storage.from('Orderly Shops').getPublicUrl(data.data!.path)
            console.log('Shop Logo:', publicUrl)
            
            let date = new Date()
            let shopID = uuidv4()
            let insertObject: Tables<'shops'> = {
                id: shopID,
                createdAt: date.toISOString(),
                description: shopDesc,
                imageURL: publicUrl,
                location: {
                    aptNum: aptNum,
                    streetAddress: streetAddress,
                    city: city,
                    region: region,
                    country: country
                },
                name: shopName,
                optionalEmail: null,
                optionalPhone: null,
                shopNameTag: shopNameTag,
                tags: shopTags,
                updatedAt: date.toISOString(),
                user_id: user!.id
            }

            supabase
            .from('shops')
            .insert(insertObject).then(()=>{
                supabase.auth.updateUser({
                    data: {
                        isOrderly: true,
                        shopID: shopID
                    }
                }).then(()=>{
                    handleChangeQuestions('page7s', 'page8s')
                    setTimeout(() => {
                        setSubmitted(false)
                    }, 250);
                })
            })
        })
    }

    function handleConfirmPaymentPlan(){ // page8s
        setSubmitted(true)
        supabase.auth.updateUser({
            data: {
                plan: {
                    name: selectedPlan?.name,
                    isAnnual: isPayingAnnually
                }
            }
        }).then(()=>{
            handleChangeQuestions('page8s', 'page9s')
            setTimeout(()=>{setSubmitted(false)}, 250)
        })
    }

    function handleShopUpdate(){
        // Update shop user with data,
        // Update shop table with new shop
    }

    useEffect(()=>{
        handleIsOrderlyChoice('orderly')
    },)

    return (
        <>
            <div className="m-auto w-[80%]  md:mt-8 lg:mt-15 max-w-56 flex justify-center">
                <dialog ref={planSelectorDialog} className="p-8 w-fit min-w-[30rem] rounded-xl border-2 border-peach">
                    <form className="bg-white flex flex-col gap-2" onSubmit={()=>{}}>
                        <h1 className="text-3xl">{selectedPlan?.name} Plan</h1>
                        { selectedPlan?.cost[0] !== 0 && <h2 className="font-black mb-2">GHS{selectedPlan?.cost[(isPayingAnnually) ? 0 : 1]}.00/{(isPayingAnnually) ? 'month for 12 months' : 'month'}</h2> }
                        { selectedPlan?.cost[0] == 0  && <h2 className="font-black mb-2">GHS0.00</h2> }
                        <p className='font-semibold'>Features</p>
                        <div className="mb-2 pl-2">
                            { selectedPlan?.fillText !== '' && <p className="text-gray-400">- { selectedPlan?.fillText}</p> }
                            { selectedPlan?.features.map((feature:string, idx:number)=>{
                                return (<p key={idx}>- {feature}</p>)
                            }
                            )}
                        </div>
                        <span>
                            <button className="rounded-full w-full mb-2" disabled={submitted} onClick={(e)=>{e.preventDefault(); planSelectorDialog.current?.close(); handleConfirmPaymentPlan() }} >
                                <div style={{display: submitted ? 'block' : 'none'}} id="loading"></div>
                                <span style={{display: submitted ? 'none' : 'block'}} >Confirm Selection</span>
                            </button>
                            <button onClick={(e)=>{e.preventDefault(); planSelectorDialog.current?.close()}} className="btn-secondary rounded-full w-full">Go Back</button>
                        </span>
                    </form>
                </dialog>
                <div ref={parent} className="flex flex-col items-center gap-4 w-80 ">
                    <h6>Ready to get orderly?</h6>
                    <form className="flex flex-col items-center gap-4" onSubmit={()=>{}} style={{display: 'flex'}} id='page1'>
                        <h1 className="text-3xl text-center font-bold">Let's get to know you!</h1>
                        <p className="mb-4">What do we call you?</p>
                        <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="First Name" pattern="/^\w+$/" type="text" id='firstName' minLength={1} maxLength={30} onChange={(e)=>{setFirst(e.target.value)}} required/>
                        <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Last Name" type="text" id='lastName' onChange={(e)=>{setLast(e.target.value)}} minLength={8} required/>
                        <button onClick={(e)=>{e.preventDefault(); handleChangeQuestions('page1', 'page2')}} className="rounded-full w-full mb-4">Let's Go</button>
                    </form>

                    <form className="flex flex-col items-center gap-4" onSubmit={()=>{}} style={{display: 'none'}} id='page2'>
                        <h1 className="text-3xl text-center font-bold">Enter Your Phone Number</h1>
                        <p className="mb-4">We need this to verify your identity</p>
                        <input className="p-2 pl-4 bg-peach rounded-full w-full mb-4" placeholder="Phone Number" type="string" id='phoneNumber' pattern="[0-9].*" minLength={8} maxLength={13} onChange={(e)=>{setPhone(e.target.value)}} required/>
                        <span className="w-full mb-4">
                            <button className="rounded-full w-full mb-2" disabled={submitted}  onClick={(e)=>{e.preventDefault(); generateOTP() } } >
                                <div style={{display: submitted ? 'block' : 'none'}} id="loading"></div>
                                <span style={{display: submitted ? 'none' : 'block'}} >Verify Your Phone Number</span>
                            </button>
                            <button onClick={(e)=>{e.preventDefault(); handleChangeQuestions('page2', 'page1') }} className="btn-secondary rounded-full w-full mb-4">Go Back</button>
                        </span>
                    </form>

                    <form className="flex flex-col items-center gap-4" onSubmit={()=>{}} style={{display: 'none'}} id='page3'>
                        { sentOTPSuccess /* If the OTP was sent successfully */ && <>
                            <h1 className="text-3xl text-center font-bold">Enter Your OTP Code</h1>
                            <p className="mb-4">{OTPMessage}</p>
                            <input className="p-2 pl-4 bg-peach rounded-full w-full mb-4" placeholder="OTP Code" type="text" id='otp' pattern="[0-9].*" minLength={6} maxLength={6} onChange={(e)=>{setOTP(e.target.value)}} required/>
                            <span className="mb-4 w-full">
                                <button className="rounded-full w-full" disabled={submitted}  onClick={(e)=>{e.preventDefault(); verifyOTP() } } >
                                    <div style={{display: submitted ? 'block' : 'none'}} id="loading"></div>
                                    <span style={{display: submitted ? 'none' : 'block'}} >Verify Your OTP</span>
                                </button>
                            </span>
                            <p className="font-bold text-red text-center" style={{display: (OTPVerifySuccess !== null) ? ( (OTPVerifySuccess) ? 'None': 'Block') : 'None' }}>{OTPVerifySuccessMessage}</p>
                        </>
                        }

                        { !sentOTPSuccess && <>
                            <h1 className="text-3xl text-center font-bold text-red">Oh no!</h1>
                            <p className="mb-4">We've encountered an error.<br />Please try again in five minutes</p>
                            <button onClick={(e)=>{e.preventDefault(); handleChangeQuestions('page3', 'page2') }} className="btn-secondary rounded-full w-full mb-4">Go Back</button>
                            
                        </>
                        }

                    </form>

                    <div className="flex flex-col items-center gap-4 w-72" style={{display: 'none'}} id='page4'>
                        <h1 className="text-3xl text-center font-bold mb-4">I am a..</h1>
                        <div className="mb-8">
                            <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                                <span className="group w-full duration-150 md:w-[250px] border-[3px] border-transparent cursor-pointer h-12 md:h-48 flex flex-col-reverse p-8 bg-red hover:bg-darkRed rounded-xl" ref={orderlyRef} onClick={()=>{handleIsOrderlyChoice('orderly')}}>
                                    <h2 className="text-white w-[90%] text-right text-3xl">A Shop Owner</h2>
                                    </span>
                                <span className="group w-full md:w-[250px] duration-150 border-[3px] border-transparent cursor-pointer h-12 md:h-48 p-8  flex flex-col-reverse bg-gray-200 hover:bg-darkRed rounded-xl" ref={notOrderlyRef} onClick={()=>{handleIsOrderlyChoice('notOrderly')}}>
                                    <h2 className=" text-black w-[90%] group-hover:text-white text-3xl text-right">A Shopper</h2>
                                </span>
                            </div>
                        </div>
                        <button onClick={(e)=>{e.preventDefault(); isOrderlyTemp ? handleChangeQuestions('page4', 'page5s') : handleChangeQuestions('page4','page5c') }} className="rounded-full w-full mb-4">Next &rarr;</button>
                    </div>

                    <form className="flex flex-col items-center gap-4 w-72" style={{display: 'none'}} id='page5c'>
                        <h1 className="text-3xl text-center font-bold">Where are you located?</h1>
                        <p className="mb-4">This is optional, but it helps us save your location for any future orders</p>
                        <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Apt. Number/House Number" type="string" id='aptNumber' maxLength={20} onChange={(e)=>{setAptNum(e.target.value)}}/>
                        <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Street Address" type="string" id='streetAddr' maxLength={50} onChange={(e)=>{setStreetAddress(e.target.value)}}/>
                        <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="City" type="string" id='city' maxLength={30} onChange={(e)=>{setCity(e.target.value)}}/>
                        <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Region" type="string" id='region' maxLength={30} onChange={(e)=>{setRegion(e.target.value)}} required/>
                        <input className="p-2 pl-4 bg-peach rounded-full w-full mb-4" placeholder="Country" type="string" id='country' maxLength={30} onChange={(e)=>{setCountry(e.target.value)}}/>
                        <span className="mb-4 w-full">
                            <button className="rounded-full w-full mb-2" disabled={submitted} onClick={(e)=>{e.preventDefault(); handleUpdateUserWithOrderlyStatAndLocation() } } >
                                <div style={{display: submitted ? 'block' : 'none'}} id="loading"></div>
                                <span style={{display: submitted ? 'none' : 'block'}} >Save Location</span>
                            </button>
                            <span onClick={(e)=>{e.preventDefault(); handleUpdateUserWithOrderlyStatAndLocation() }} className="text-center cursor-pointer font-medium hover:font-black flex justify-center rounded-full w-full mb-8">Skip</span>
                            <button onClick={(e)=>{e.preventDefault(); handleChangeQuestions('page5c', 'page4') }} className="btn-secondary rounded-full w-full mb-4">Go Back</button>
                        </span>
                    </form>

                    <div className="flex flex-col items-center gap-4 w-72" style={{display: 'none'}} id='page5s'>
                        <h1 className="text-3xl text-center font-bold">Where is your shop located?</h1>
                        <p className="mb-4 text-center">This information can be seen by your customers</p>
                        <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Building Number (not required)" type="string" id='buildingNumber' maxLength={20} onChange={(e)=>{setAptNum(e.target.value)}}/>
                        <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Street Address" type="string" id='streetAddr' maxLength={50} onChange={(e)=>{setStreetAddress(e.target.value)}} required/>
                        <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="City" type="string" id='city' maxLength={30} onChange={(e)=>{setCity(e.target.value)}} required/>
                        <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Region" type="string" id='region' maxLength={30} onChange={(e)=>{setRegion(e.target.value)}} required/>
                        <input className="p-2 pl-4 bg-peach rounded-full w-full mb-4" placeholder="Country" type="string" id='country' maxLength={30} onChange={(e)=>{setCountry(e.target.value)}} required />
                        <span className="mb-4 w-full">
                            <button className="rounded-full w-full mb-2" onClick={(e)=>{e.preventDefault(); handleChangeQuestions('page5s', 'page6s') } } >Save Location</button>
                            <button onClick={(e)=>{e.preventDefault(); handleChangeQuestions('page5s', 'page4') }} className="btn-secondary rounded-full w-full mb-4">Go Back</button>
                        </span>
                    </div>

                    <div className="flex flex-col items-center gap-4 w-72" style={{display: 'none'}} id='page6c'>
                        <h1 className="text-3xl text-center font-bold">All done, {firstName}.</h1>
                        <p className="mb-4">Welcome to Orderly!</p>
                        <span className="mb-4 w-full">
                            <Link href={`/${destination || ''}`} prefetch={false}><button className="rounded-full w-full mb-2" onClick={(e)=>{e.preventDefault()} } >Let's Go!</button></Link>
                        </span>
                    </div>

                    <div className="flex flex-col items-center gap-4 w-72" style={{display: 'none'}} id='page6s'>
                        <h1 className="text-3xl text-center font-bold">Let's set up your shop.</h1>
                        <p className="mb-4 text-center">This step just takes a couple seconds!</p>
                        <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Full Name (eg. Orderly Ghana)" type="string" id='shopFullName' maxLength={50} onChange={(e)=>{setShopName(e.target.value)}}/>
                        <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Nametag (eg. orderlyghana)" type="string" id='shopNameTag' maxLength={50} onChange={(e)=>{setShopNameTag(e.target.value)}} required/>
                        <span className="w-full"> 
                            {shopLogoURL && <>
                                <span className="w-16 h-16 m-auto border-2 border-gray-400 overflow-hidden flex items-center justify-center rounded-full">
                                        <img className="w-full" src={ shopLogoURL ?? ''}/>
                                </span>
                            </> 
                            }

                            <label className="bg-peach group rounded-xl hover:bg-darkRed flex w-full p-3 font-bold text-black hover:text-white duration-150 cursor-pointer justify-center items-center gap-3 my-4" htmlFor="logo">
                                Upload your shop logo <FontAwesomeIcon icon={faUpload} />
                            </label>
                            <input className="p-2 pl-4 bg-peach rounded-full w-full hidden"   accept="image/*" type="file" multiple={false} id='logo' maxLength={30} onChange={(e)=>{handleImageChange(e.target.files![0])}} required/>
                            <p className="text-red font-medium text-center" style={{display: (submissionErr)? 'block': 'none' }}>File size is too large. Please upload files less than 2MB.<br />You can use <a href="https://tinypng.com/" className=" underline">tinyPNG</a> to reduce your file size.</p>
                        </span>
                        <span className="mb-4 w-full">
                            <button className="rounded-full w-full mb-2" disabled={submissionErr} onClick={(e)=>{e.preventDefault(); handleChangeQuestions('page6s', 'page7s') } } >Set Up Shop</button>
                            <button onClick={(e)=>{e.preventDefault(); handleChangeQuestions('page6s', 'page5s') }} className="btn-secondary rounded-full w-full mb-4">Go Back</button>
                        </span>
                    </div>

                    <form className="flex flex-col items-center gap-4 w-72" onSubmit={()=>{}} style={{display: 'none'}} id='page7s'>
                        <h1 className="text-3xl text-center font-bold">Your profile's looking good.</h1>
                        <p className="mb-4 text-center w-[95%]">Add a few more details to complete it!</p>
                        <div className="w-full flex mb-4 rounded-2xl bg-gray-100 p-4">
                            <div className="flex items-center gap-4">
                                <span className="w-16 h-16 border-2 border-gray-400 overflow-hidden flex items-center justify-center rounded-full">
                                        <img className="w-full" src={ shopLogoURL ?? ''}/>
                                </span>
                                <span className="flex flex-col gap-0">
                                    <h1 className="text-xl">{shopName}</h1>
                                    <h3 className="text-md font-semibold">@{shopNameTag}</h3>
                                </span>
                            </div>
                        </div>
                        <textarea className="p-2 pl-4 bg-peach rounded-xl w-full" rows={3} placeholder="A short description of your shop." id='shopDesc' maxLength={100} onChange={(e)=>{setShopDesc(e.target.value)}} />
                        <input className="p-2 pl-4 bg-peach rounded-full w-full mb-4" placeholder="Descriptive tags separated by commas (eg. tag1, tag2)" type="string" id='shopTags' maxLength={70} onChange={(e)=>{setShopTags(getCSV(e.target.value).slice(0,4))}} required />
                        <span className="mb-4 w-full">
                            <button className="rounded-full w-full mb-2" disabled={submitted} onClick={(e)=>{e.preventDefault(); handleCreateShop() } } >
                                <div style={{display: submitted ? 'block' : 'none'}} id="loading"></div>
                                <span style={{display: submitted ? 'none' : 'block'}} >One more to go!</span>
                            </button>
                            <button onClick={(e)=>{e.preventDefault(); handleChangeQuestions('page7s', 'page6s') }} className="btn-secondary rounded-full w-full mb-4">Go Back</button>
                        </span>
                    </form>

                    <form className="flex flex-col items-center gap-4 w-72"  onSubmit={()=>{}} style={{display: 'none'}} id='page8s'>
                        <h1 className="text-3xl text-center font-bold">Choose your payment plan</h1>
                        <p className="mb-4 text-center">Last step! Paying for Orderly give you more features like increased shop inventory and a custom logo on your shop!</p>
                        <div className="flex gap-2 mb-4">
                            <button className={`${(isPayingAnnually) ? '' : 'btn-secondary'}`} onClick={(e)=>{ e.preventDefault(); handleChangeQuestions('page8s', 'page8s'); setTimeout(()=>setPayingAnnually(true),250)} }>Paid Annually</button>
                            <button className={`${(isPayingAnnually) ? 'btn-secondary' : ''}`} onClick={(e)=>{ e.preventDefault(); handleChangeQuestions('page8s', 'page8s'); setTimeout(()=>setPayingAnnually(false),250)} }>Paid Monthly</button>
                        </div>
                        <div className={`flex flex-col gap-4 rounded-md ${isPayingAnnually ? 'w-[39rem]' :  'w-[35rem]'} mb-4`}>
                            { OrderlyPlans.map((plan:IPlan, idx :number) => {
                                return (
                                    <div className={`w-full flex flex-row items-center gap-4 ${(plan.recommended)? 'bg-darkRed text-white' : 'bg-peach'} hover:shadow-md duration-150 justify-between px-6 py-4 ${(selectedPlan?.name == plan.name) ? 'border-darkRed' : 'border-peach'}`} key={idx} >
                                        <span>
                                            <h2 className="inline text-xl">{plan.name}</h2> • <h2 className="inline font-semibold text-lg">GHS{plan.cost[(isPayingAnnually) ? 0 : 1]}.00/{(isPayingAnnually) ? 'month for 12 months' : 'month'}</h2>
                                        </span>
                                        <span >
                                            <button className={`${( plan.recommended) ? 'btn-no-shadow' : 'btn-secondary'}`} onClick={(e)=>{e.preventDefault(); showPaymentPlan(plan)}}>Choose Plan</button>
                                        </span>
                                    </div>
                                )
                            })
                            }
                        </div>
                        <span className="mb-4 w-full">
                             <button onClick={(e)=>{e.preventDefault(); handleChangeQuestions('page8s', 'page7s') }} className="btn-secondary rounded-full w-full mb-4">Go Back</button>
                        </span>
                    </form>

                    <div className="flex flex-col items-center gap-4 w-72" style={{display: 'none'}} id='page9s'>
                        <h1 className="text-3xl text-center font-bold">All done, {( firstName ?? ( user?.user_metadata.firstName) ) ?? "What's next?" }</h1>
                        <p className="">Show orderly to the <span className="text-red">world.</span></p>
                        <div className="flex flex-col mb-4 text-center gap-3 p-8 bg-peach rounded-xl shadow-sm w-72">
                            <h3 className="font-bold text-xl">You can do all this - and more - with Orderly</h3>
                            <p>Take client orders</p>
                            <p>Manage order fulfillment</p>
                            <p>Showcase you products</p>
                            <p>Manage your inventory</p>
                        </div>
                        <span className="mb-4 w-full">
                            <Link href={`/s/dashboard`} prefetch={false}><button className="rounded-full w-full mb-2" >Access Your Dashboard</button></Link>
                        </span>
                    </div>

                </div>
            </div>
        </>
    )
}