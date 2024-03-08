"use client"
import { clientSupabase } from "@/app/supabase/supabase-client"
import Footer from "@/components/Footer.component"
import Header from "@/components/Header.component"
import { popupText } from "@/components/Popup.component"
import { supportedCountries } from "@/constants/country-codes"
import { POPUP_STATE } from "@/models/popup.enum"
import { signedInUser } from "@/models/user.model"
import { TablesUpdate } from "@/types/supabase"
import { findFlagUrlByIso3Code } from "country-flags-svg"
import { useRouter } from "next/navigation"
import { usePostHog } from "posthog-js/react"
import { ChangeEvent, FormEvent, useEffect, useState } from "react"


export default function UserSettingsComponent({user}:{user: signedInUser}){

    const [updateUser, setUpdateUser ] = useState<TablesUpdate<'user_metadata'>>({})
    const [updateUserLocation, setUpdateUserLocation ] = useState<TablesUpdate<'locations'>>({})

    const [firstChanged, setFirstChanged ] = useState<boolean>(false)
    const [secondChanged, setSecondChanged ] = useState<boolean>(false)

    const [ isLoading, setIsLoading ] = useState<boolean>(false)

    const router = useRouter()
    const posthog = usePostHog()
    
    useEffect(() => {
        posthog.startSessionRecording()
    })

    function handleValueChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>){
        const field = e.target.name
        const value = e.target.value
        

        switch (field) {
            case 'firstName':
            case 'lastName':
            case 'email':
            case 'phoneNumber':
                setFirstChanged(true)
                setUpdateUser((prev) =>{
                    return ({
                        ...prev,
                        [field]:value
                    })
                })
                break;
            case 'buildingNum':
            case 'streetAddress':
            case 'city':
            case 'region':
            case 'country':
                setSecondChanged(true)
                setUpdateUserLocation((prev) => {
                    return ({
                        ...prev,
                        [field]:value
                    })
                })
                break;
            default:
                throw new Error('Field not valid')
        }
        console.log(firstChanged, secondChanged)
    }

    function handleUpdateUser(e: FormEvent){
        e.preventDefault()

        if(firstChanged || secondChanged) {
            if(firstChanged){

                setIsLoading(true)
                clientSupabase
                .from('user_metadata')
                .update(updateUser)
                .eq('id', user.id)
                .then(({error}) => {
                    if(error != null){
                        popupText(`SB${error.code}: An error occurred when updating your details.`, POPUP_STATE.FAILED)
                    } else {
                        !secondChanged ? popupText('Update successful', POPUP_STATE.SUCCESS) : null
                        setSecondChanged(false)
                        setIsLoading(false)
                        !secondChanged ? router.refresh : null
                    }
                })
            }
    
            if(secondChanged){
                setIsLoading(true)
                clientSupabase
                .from('locations')
                .update(updateUserLocation)
                .eq('id', user.location.id)
                .then(({error}) => {
                    if(error != null){
                        popupText(`SB${error.code}: An error occurred when updating your location.`, POPUP_STATE.FAILED)
                    } else {
                        popupText('Update successful', POPUP_STATE.SUCCESS)
                        setSecondChanged(false)
                        setIsLoading(false)
                        router.refresh()
                    }
                })
            }
        }
        return
    }

    ///console.log(user.location)

    return (
        <>
            <Header signedInUser={user} />
            <main className="w-screen min-h-[calc(100vh-50px-173px)] md:min-h-[calc(100vh-70px-66px)] bg-gray-50 grid place-items-center">
                <div className="w-full bg-white p-4 md:p-8 md:shadow-md md:rounded-xl md:max-w-[800px] md:overflow-auto h-full md:max-h-[550px]">
                    <div className="h-fit">
                        <div className="mb-4 md:mb-8">
                            <h1 className="font-bold text-2xl mb-4 md:mb-1">My Account Settings</h1>
                            <div className="w-full">
                                <form className="flex flex-col gap-3 mb-8 md:mb-3" onSubmit={handleUpdateUser}> 
                                    <div className="w-full flex items-center justify-between mb-1 md:-mb-1">
                                        <h3 className="text-gray-500 text-sm">GENERAL</h3>
                                        <button className="hidden md:block" disabled={ !(firstChanged || secondChanged) || isLoading}>
                                            <div style={{display: isLoading ? 'block' : 'none'}} id="loading"></div>
                                            <span style={{display: isLoading ? 'none' : 'block'}} >Save</span>
                                        </button>
                                    </div>
                                    <span className="flex flex-col md:flex-row gap-3 md:gap-6">
                                        <div className="w-full flex flex-col gap-2">
                                            <label htmlFor='firstName' className="font-medium text-sm" >First Name</label>
                                            <input className="p-2 pl-4 text-lg bg-peach rounded-full w-full" 
                                                type="text"
                                                required
                                                id="firstName"
                                                name="firstName"
                                                onChange={handleValueChange}
                                                defaultValue={user.firstName}
                                            />
                                        </div>
                                        <div className="w-full flex flex-col gap-2">
                                            <label htmlFor='lastName' className="font-medium text-sm" >Last Name</label>
                                            <span className="flex items-center gap-2">
                                                <input className="p-2 pl-4 text-lg bg-peach rounded-full w-full" 
                                                    type="text"
                                                    required
                                                    id="lastName"
                                                    name="lastName"
                                                    onChange={handleValueChange}
                                                    defaultValue={user.lastName}
                                                />
                                            </span>
                                        </div>
                                    </span>

                                    <span className="flex flex-col md:flex-row gap-3 md:gap-6">
                                        <div className="w-full flex flex-col gap-2">
                                            <label htmlFor='email' className="font-medium text-sm" >Email Address</label>
                                            <input className="p-2 pl-4 text-lg bg-peach rounded-full w-full" 
                                                type="text"
                                                required
                                                id="email"
                                                name="email"
                                                onChange={handleValueChange}
                                                defaultValue={user.email}
                                            />
                                        </div>
                                        <div className="w-full flex flex-col gap-2">
                                            <label htmlFor='phoneNumber' className="font-medium text-sm" >Phone Number</label>
                                            <span className="flex items-center gap-2">
                                                <input className="p-2 pl-4 text-lg bg-peach rounded-full w-full" 
                                                    type="text"
                                                    required
                                                    id="phoneNumber"
                                                    name="phoneNumber"
                                                    onChange={handleValueChange}
                                                    defaultValue={user.phoneNumber ?? ''}
                                                />
                                            </span>
                                        </div>
                                    </span>
                                    <div className="w-full flex items-center justify-between mt-3 md:mt-0 mb-1 md:-mb-1">
                                        <h3 className="text-gray-500 text-sm">DELIVERY LOCATION</h3>
                                    </div>

                                    <span className="flex flex-col md:flex-row gap-3 md:gap-6">
                                        <div className="w-full md:w-2/12 flex flex-col gap-2">
                                            <label htmlFor='buildingNum' className="font-medium text-sm" >Building No.</label>
                                            <input className="p-2 pl-4 text-lg bg-peach rounded-full w-full" 
                                                type="text"
                                                required
                                                id="buildingNum"
                                                name="buildingNum"
                                                onChange={handleValueChange}
                                                defaultValue={user.location.buildingNum}
                                            />
                                        </div>
                                        <div className="w-full md:w-7/12 flex flex-col gap-2">
                                            <label htmlFor='streetAddress' className="font-medium text-sm" >Street Address</label>
                                            <span className="flex items-center gap-2">
                                                <input className="p-2 pl-4 text-lg bg-peach rounded-full w-full" 
                                                    type="text"
                                                    required
                                                    id="streetAddress"
                                                    name="streetAddress"
                                                    onChange={handleValueChange}
                                                    defaultValue={user.location.streetAddress}
                                                />
                                                <br className="md:hidden" />
                                            </span>
                                        </div>
                                        <div className="w-full md:w-3/12 flex flex-col gap-2">
                                            <label htmlFor='city' className="font-medium text-sm" >City</label>
                                            <input className="p-2 pl-4 text-lg bg-peach rounded-full w-full" 
                                                type="text"
                                                required
                                                id="city"
                                                name="city"
                                                onChange={handleValueChange}
                                                defaultValue={user.location.city}
                                            />
                                        </div>
                                    </span>

                                    <span className="flex flex-col md:flex-row gap-3 md:gap-6">
                                        
                                        <div className="w-full flex flex-col gap-2">
                                            <label htmlFor='region' className="font-medium text-sm" >Region</label>
                                            <span className="flex items-center gap-2">
                                                <input className="p-2 pl-4 text-lg bg-peach rounded-full w-full" 
                                                    type="text"
                                                    required
                                                    id="region"
                                                    name="region"
                                                    onChange={handleValueChange}
                                                    defaultValue={user.location.region }
                                                />
                                            </span>
                                        </div>
                                        <div className="w-full flex flex-col gap-2">
                                            <label htmlFor='country' className="font-medium text-sm" >Country</label>
                                            <span className="w-full relative">
                                                <select id='country' className="p-2 pl-10 pr-4 bg-peach w-full rounded-full" name="country" onChange={handleValueChange} required>
                                                    {
                                                        supportedCountries.map((country, idx) => {
                                                            return (
                                                                <option className="flex bg-white hover:bg-gray-50 duration-150 p-2 items-center gap-2" key={idx} selected={country.isoCode == user.location.country} value={country.isoCode}>
                                                                    <span className="ml-2">{country.name}</span>
                                                                </option>
                                                            )
                                                        })
                                                    }
                                                </select>
                                                <span className="absolute top-[0.6rem] left-4">
                                                    <img className="w-[20px] h-[17px]" src={findFlagUrlByIso3Code(user.location.country)} />
                                                </span>
                                            </span>
                                        </div>
                                    </span>
                                    <button className="w-full md:hidden mt-3" disabled={ !(firstChanged || secondChanged) || isLoading}>
                                            <div style={{display: isLoading ? 'block' : 'none'}} id="loading"></div>
                                            <span style={{display: isLoading ? 'none' : 'block'}} >Save</span>
                                        </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )

}