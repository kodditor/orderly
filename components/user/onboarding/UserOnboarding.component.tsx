"use client"
import { clientSupabase } from "@/app/supabase/supabase-client";
import { fadePages, getLocalShop } from "@/app/utils/frontend/utils";
import Footer from "@/components/Footer.component";
import Header from "@/components/Header.component";
import { popupText } from "@/components/Popup.component";
import { supportedCountries } from "@/constants/country-codes";
import { IOTPPayload } from "@/models/otp.model";
import { POPUP_STATE } from "@/models/popup.enum";
import { TablesInsert } from "@/types/supabase";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { PostgrestSingleResponse, User } from "@supabase/supabase-js";
import { findFlagUrlByIso3Code } from "country-flags-svg";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import OTPInput from 'react-otp-input';

export default function UserOnboardingComponent({user} : {user:User}){

    const searchParams = useSearchParams()
    let destination = searchParams.get('to')
    
    const captchaRef = useRef<HCaptcha>(null);

    const [ newUser, setNewUser ] = useState<TablesInsert<'user_metadata'>>({
        id: user.id,
        firstName: "",
        lastName: "",
        phoneNumber: ""
    })

    const [ unverifiedPhoneNumber, setUnverifiedPhone ] = useState<string>('')

    const [ newLocation, setNewLocation ] = useState<TablesInsert<'locations'>>({
        buildingNum: "",
        streetAddress: "",
        region: "",
        country: "GHA"
    })

    const phoneCountryCode = supportedCountries.find((country) => country.isoCode == newLocation.country)!.telephoneCode

    const [ submitted, setSubmitted ] = useState<boolean>(false)
    const [ verified, setVerified   ] = useState<boolean>(false)
    
    const [ OTP, setOTP ] = useState<string>('')

    const [ sentOTPSuccess, setSentOTPSuccess ] = useState<boolean | null>(null)
    const [ OTPMessage, setOTPMessage ] = useState<string>('')

    const [ OTPVerifySuccess ,setOTPVerifySuccess ] =  useState<boolean | null>(null)
    const [ OTPVerifySuccessMessage ,setOTPVerifySuccessMessage ] =  useState<string | null>(null)

    const parent = useRef<HTMLDivElement|null>(null)

    function handleChangeQuestions(curr:string, next:string){
        fadePages(parent)
        setTimeout(() => {
            document.getElementById(curr)!.style.display = 'none'
            document.getElementById(next)!.style.display = 'flex'
            
        }, 250);
    }
    
    function generateOTP(){
        if(process.env.NEXT_PUBLIC_ENV == 'DEV'){
            setSentOTPSuccess(true)
            handleChangeQuestions('page1','page2')
            return
        }

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
        if(process.env.NEXT_PUBLIC_ENV == 'DEV'){
            setOTPVerifySuccess(true)
            handleChangeQuestions('page2','page3')
            console.log(unverifiedPhoneNumber.startsWith('0') ? phoneCountryCode + unverifiedPhoneNumber.slice(1) : phoneCountryCode + unverifiedPhoneNumber)
            return
        }

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
                        phoneNumber: number
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

    async function handleUpdateUserWithBasicInfo(){
        let insertObject:TablesInsert<'user_metadata'> = {
            ...newUser,
            email: user.email
        }

        if(process.env.NEXT_PUBLIC_ENV == 'DEV'){
            setOTPVerifySuccess(true)
            handleChangeQuestions('page2','page3')
            console.log(insertObject)
            return
        }
       
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/db/user`, {
            method: 'POST',
            body: JSON.stringify(insertObject)
        })
        .then(res => res.json())
        .then(({data, error}:PostgrestSingleResponse<{id: string}[]>) => {
            if(error){
                console.log(error)
                popupText(`SB${error.code}: An error occurred`, POPUP_STATE.FAILED)
            } else{
                if(data[0].id != newUser.id){
                    throw('ids in users table and user_metadata table are not equal')
                } else {
                    handleChangeQuestions('page2', 'page3')
                    setTimeout(() => {
                        setSubmitted(false)
                    }, 250);
                }
            }
        })
    }

    function handleUpdateUserWithLocation(){
        if(process.env.NEXT_PUBLIC_ENV == 'DEV'){
            setOTPVerifySuccess(true)
            handleChangeQuestions('page3','page4')
            console.log(newLocation)
            return
        }

        setSubmitted(true)

        clientSupabase
        .from('locations')
        .insert(newLocation)
        .select('id')
        .then(({data, error}) => {
            if(error != null){
                popupText(`SB${error.code}: An error occurred while saving your location`, POPUP_STATE.FAILED)
            }
            else {
                clientSupabase
                .from('user_metadata')
                .update({location: data[0].id})
                .eq('id', user.id)
                .then(({error}) => {
                    if(error != null){
                        popupText(`SB${error.code}: An error occurred while saving your location`, POPUP_STATE.FAILED)
                    }
                    else {
                        popupText('Location saved successfully', POPUP_STATE.SUCCESS)
                        handleChangeQuestions('page3', 'page4')
                        setNewUser((prev) => {
                            return ({
                                ...prev,
                                'location': data[0].id
                            })
                        })
                        setNewLocation((prev) => {
                            return ({
                                ...prev,
                                'id': data[0].id
                            })
                        })
                    }
                    setTimeout(() => setSubmitted(false), 250)
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

            default:
                throw Error(`${field} field not implemented`)
        }
        console.log(newUser, newLocation)
    }

    return (
        <>
            <Header signedInUser={null} />
            <div className="m-auto w-[80%] min-h-[calc(100vh-50px-190px)] md:min-h-[calc(100vh-70px-122px)] mt-4 md:mt-6 mb-8 max-w-72 md:max-w-80 flex justify-center">
                <div ref={parent} className="flex flex-col items-center gap-3 md:gap-4 w-80 ">
                    <h6>Ready to get orderly?</h6>
                    <form className="flex flex-col items-center gap-3 md:gap-4" onSubmit={(e)=>{e.preventDefault(); generateOTP()}} style={{display: 'flex'}} id='page1'>
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
                                <div className="w-fit m-auto mt-3 mb-4">
                                    <OTPInput
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

                    <form className="flex flex-col items-center gap-4 w-80" onSubmit={(e)=>{e.preventDefault(); handleUpdateUserWithLocation()} } style={{display: 'none'}} id='page3'>
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
                        <h1 className="text-3xl text-center font-medium mb-4">I am a..</h1> {/* onclick to either redirect to shop onboarding or continue to page 5 */}
                        <div className="mb-8">
                            <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                                <Link href={`/s/onboarding${ (destination == null ) ? '' : `?to=${destination}` }`}>
                                    <span className="group w-full duration-150 md:w-[300px] border-[3px] border-transparent cursor-pointer text-white hover:text-darkRed h-12 md:h-72 flex flex-col-reverse items gap-8 p-8 bg-red hover:bg-peach rounded-xl" onClick={()=>{}}>
                                        <img src="/img/shop_owner_option.svg" width={150} />
                                        <h2 className="text-center text-3xl font-semibold">A Shop Owner</h2>
                                    </span>
                                </Link>
                                <span className="group w-full md:w-[300px] duration-150 border-[3px] border-transparent cursor-pointer h-12 md:h-72 p-8  flex flex-col-reverse items-center gap-8 bg-gray-200 hover:bg-peach rounded-xl" onClick={()=>{handleChangeQuestions('page4', 'page5')}}>
                                    <img src="/img/shopper_option.svg" width={150} />
                                    <h2 className="text-3xl text-center font-semibold">A Shopper</h2>
                                </span>
                            </div>
                        </div>
                    </div>

                    
                    <div className="flex flex-col items-center gap-4 w-72" style={{display: 'none'}} id='page5'>
                        <h1 className="text-3xl text-center font-bold">All done, {newUser.firstName}.</h1>
                        <p className="mb-4">Welcome to Orderly!</p>
                        <span className="mb-4 w-full">
                            <a href={`${process.env.NEXT_PUBLIC_BASE_URL}/${destination == null ? getLocalShop() == '' ? '' : `s/${getLocalShop()}/` : (destination?.startsWith('/') ? destination.slice(1) : destination)}`}><button className="rounded-full w-full mb-2" >Let's Go!</button></a>
                        </span>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )

}