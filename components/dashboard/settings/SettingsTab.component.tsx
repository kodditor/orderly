"use client"
import type { RootState } from "@/constants/orderly.store"
import { faArrowLeft, faExternalLink, faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { RefObject, useEffect, useRef, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { capitalizeAll, fadePages, getCSV } from "@/app/utils/frontend/utils"
import { IShop } from "@/models/shop.model"
import { popupText } from "@/components/Popup.component"
import { clientSupabase } from "@/app/supabase/supabase-client"
import { TablesUpdate } from "@/types/supabase"
import { setShop, updateShop } from "@/constants/orderly.slice"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { Dispatch } from "@reduxjs/toolkit"
import Link from "next/link"
import { supportedCountries } from "@/constants/country-codes"
import { findFlagUrlByIso3Code } from "country-flags-svg"
import { POPUP_STATE } from "@/models/popup.enum"
import { usePostHog } from "posthog-js/react"
import { getPaystack } from "@/app/utils/payments/paystack"
import { Plan, PlanResponse } from "paystack-sdk/dist/plan"
import { IPlan } from "@/models/plans.model"

export default function SettingsTabComponent(){

    const {shop, user } = useSelector((state: RootState) => state.shopAndUser) 
    const dispatch = useDispatch()

    const router = useRouter()

    const searchParams = useSearchParams()
    const section = searchParams.get('section')

    const settingsParentRef = useRef<HTMLDivElement>(null)

    const defaultPageRef = useRef<HTMLDivElement>(null) 
    const shopPageRef = useRef<HTMLDivElement>(null) 
    const deleteDialogRef = useRef<HTMLDialogElement>(null)
    
    const [ currentPage, setCurrentPage] = useState<RefObject<HTMLDivElement>>(defaultPageRef)

    const allPageRefs :{[key: string] : RefObject<HTMLDivElement>} = {
        'default': defaultPageRef,
        'my-shop': shopPageRef
    }
    const posthog = usePostHog()
    
    useEffect(() => {
        posthog.startSessionRecording()
    })


    function handleDeleteShop(e:any){
        e.preventDefault()
        let confirmationValue = e.target[0].value
        if (confirmationValue === shop.shopNameTag){
            
            clientSupabase
            .from('shops')
            .update({deleted_at: new Date().toISOString()})
            .eq('id', shop.id)
            .then(({ error }) => {
                if(!error){
                    router.push('/')
                    popupText(`${shop.name} deleted.`, POPUP_STATE.INFO)
                } else {
                    console.error(error)
                    popupText('An error occurred.', POPUP_STATE.FAILED)

                }

            })
        }
    }

    function changePageTo(nextRefName:string){
        fadePages(settingsParentRef)
        setTimeout( ()=>{
            currentPage.current!.style.display = 'none'
            allPageRefs[nextRefName]!.current!.style.display = 'block'
            setCurrentPage(allPageRefs[nextRefName])
        }, 250)
    }
 
    if(!user){
        router.push('/s/dashboard')
    }
    else {
        if(section == '' || section == null){
            return (
                <>
                    <dialog ref={deleteDialogRef} className="p-8 border-2 w-96 border-peach rounded-xl">
                        <div className="flex flex-col gap-4">
                            <h1 className="text-2xl text-center font-bold">Are you sure you want to delete your shop?</h1>
                            <h2 className="text-center text-lg" >Enter <span className="text-red font-medium">{shop.shopNameTag}</span> to confirm.</h2>
                            <form className="flex flex-col gap-4" onSubmit={handleDeleteShop}>
                                <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="" name="confirmation" required/>
                                <span className="flex flex-col md:flex-row gap-2 md:gap-4">
                                    <button className="w-full">Delete My Shop</button>
                                    <button className="w-full btn-secondary" onClick={(e)=>{e.preventDefault(); deleteDialogRef.current!.close()}}>Cancel</button>
                                </span>
                            </form>
                        </div>
                    </dialog>
                    <div className="mb-4 md:mb-8 flex w-full md:w-[calc(75%+8rem)] justify-between">
                        <h1 className="font-bold text-2xl">My Settings</h1>
                        <span className=" group flex gap-1 cursor-pointer items-center py-2 px-4 rounded-full bg-gray-100 hover:bg-gray-200 duration-150" style={{display: (currentPage == defaultPageRef) ? 'none': 'flex'}} onClick={()=>{changePageTo('default')}}>
                            <FontAwesomeIcon className="w-7 flex items-center justify-center duration-150 group-hover:mr-1 mr-0" icon={faArrowLeft} />
                            <p>Back</p>
                        </span>
                    </div>
                    <div className="mb-8 w-full md:w-[calc(75%+8rem)]" ref={settingsParentRef}>
                        <section className="w-full md:w-[calc(75%+8rem)] mb-8" >
                            <h3 className="text-gray-500 text-sm mb-4">GENERAL</h3>
                            <div className="mb-8">
                                <MyShopSettingsPage 
                                    divRef={shopPageRef}
                                    shop={shop} 
                                    router={router}
                                    dispatch={dispatch}
                                />
                            </div>

                            <h3 className="text-gray-500 text-sm mb-4">PAYMENTS & PLANS</h3>
                            <div className="mb-8">
                                <PaymentsPage shop={shop} />
                            </div>
                            <h3 className="text-gray-500 text-sm mb-4">USER</h3>
                            <Link href={'/settings'}>
                                <div className="group cursor-pointer rounded-lg flex mb-4 justify-between items-center px-4 py-2 hover:bg-gray-100 duration-150 border-2 border-gray-100" >
                                    <h2 className="text-xl">My Account</h2>
                                    <span className="w-10 h-10 bg-peach rounded-full flex items-center justify-center duration-150 group-hover:mr-0 mr-3">
                                        <FontAwesomeIcon className="w-7" icon={faExternalLink} />
                                    </span>
                                </div>
                            </Link>
                        </section>
                        <section className="w-full md:w-[calc(75%+8rem)]">
                            <div className="bg-red rounded-lg p-4 md:p-8 text-white">
                                <h1 className="mb-2 md:mb-4">DANGER ZONE</h1>
                                <div className="group cursor-pointer rounded-lg flex mb-0 md:mb-4 justify-between items-center px-4 py-2 text-black bg-white duration-150 border-2 border-gray-100" onClick={()=>{deleteDialogRef.current!.showModal()}}>
                                    <h2 className="text-xl">Delete Shop</h2>
                                    <span className="w-10 h-10 bg-peach rounded-full flex items-center justify-center duration-150 group-hover:bg-red group-hover:text-white">
                                        <FontAwesomeIcon className="w-7" icon={faTrash} />
                                    </span>
                                </div>
                            </div>
                        </section>

                    </div>
                    
                </>
            )    
        }
    }
}
function MyShopSettingsPage(
    {
        divRef,
        shop,
        router, 
        dispatch
    }
    : {
        divRef:RefObject<HTMLDivElement>, 
        shop: IShop, 
        router:AppRouterInstance,
        dispatch:Dispatch
    }){

    const [valueChanged, setValueChanged] = useState<boolean>(false)
    const [invalidValueProvided, setInvalidValueProvided] = useState<boolean>(false)

    const [updatedShop, setUpdatedShop] = useState<TablesUpdate<'shops'>>({})
    const [updatedShopLocation, setUpdatedShopLocation] = useState<TablesUpdate<'locations'>>({})

    function handleValueChange(e: any){ // events amiright?
        let field = e.target.name
        let value = e.target.value
        valueChanged ? null : setValueChanged(true)

        switch (field) {
            case 'city':
            case 'buildingNum':
            case 'streetAddress':
            case 'region':
            case 'country':
                setUpdatedShopLocation( (prev) =>{
                    return (
                        {
                            ...prev,
                            [field]: value
                        }
                    )
                })

                break;

            case 'shopNameTag':

                console.log(value)

                if(value == shop.shopNameTag){
                    return
                }

                clientSupabase
                .from('shops')
                .select('shopNameTag')
                .eq('shopNameTag', value)
                .then((res)=>{
                    if(res.error){
                        popupText(`SB${res.error.code} An error occurred. Try again later.`, POPUP_STATE.FAILED)
                        console.log(res.error)
                    }

                    if(res.data?.length != 0){
                        popupText('Please choose another name tag', POPUP_STATE.INFO)
                        document.getElementById('nameTagExists')!.style.display = 'block'
                        setInvalidValueProvided(true)
                        //console.log(res.data)
                    } else {
                        document.getElementById('nameTagExists')!.style.display = 'none'
                        invalidValueProvided ? setInvalidValueProvided(false) : null

                        setUpdatedShop( (prev) =>{
                            return (
                                {
                                    ...prev,
                                    [field]: value
                                }
                            )
                        })
                    }
                })

                break


            case 'tags':
                setUpdatedShop( (prev) =>{
                    return (
                        {
                            ...prev,
                            tags: getCSV(value).slice(0, 4)
                        }
                    )
                })

                break;

            default:
                setUpdatedShop( (prev) =>{
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


    function handleUpdateShopDetails(e :any){


        e.preventDefault()
        if(!valueChanged){
            popupText('Shop was not updated, nothing changed.', POPUP_STATE.INFO)
            return
        }

        let date = new Date()

        let updateObject = {
            ...updatedShop,
            'updatedAt': date.toISOString(),
            'createdAt': shop.createdAt
        }

        //console.log(updateObject)
        const supabase = clientSupabase
        
        //console.log(updatedShopLocation)

        supabase.from('locations')
        .update(updatedShopLocation)
        // @ts-ignore
        .eq('id', shop.location.id!)
        .select()
        .then( ({data, error}) => {
            if(error){
                console.log(error)
                popupText(`SB${error.code}: An error occured when updating the location.`, POPUP_STATE.FAILED)
            } else {
                //console.log(data, shop.location.id)
                dispatch(updateShop({ location: data![0] }))
                supabase.from('shops')
                .update(updateObject)
                .eq('id', shop.id)
                //.eq('user_id', user.id)
                .select()
                .then( ({data, error}) =>{
                    if(!error){
                        //console.log(data[0], error, shop.id)
                        popupText("Shop Updated Successfully", POPUP_STATE.SUCCESS)
                        //@ts-ignore
                        dispatch(setShop(data[0])) 
                        setTimeout(() => router.push('/s/dashboard'), 1000)
                            
                    } else {
                        popupText(`SB${error.code}: An error occurred. Please try again later.`, POPUP_STATE.FAILED)
                        console.error(error)
                    }
                })

            }
        })

    }

    return (
        <>
            <div className="w-full" ref={divRef}>
                <form className="flex flex-col gap-6" onSubmit={(e)=>e.preventDefault()}>
                    <span className="flex flex-col md:flex-row gap-6">
                        <div className="w-full flex flex-col gap-2">
                            <label htmlFor='name' className="font-medium text-sm" >Shop Name</label>
                            <input className="p-2 pl-4 text-lg bg-peach rounded-full w-[clamp(200px,100%,400px)]" 
                                type="text"
                                required
                                id="name"
                                name="name"
                                onChange={handleValueChange}
                                defaultValue={shop.name}
                            />
                        </div>
                        <div className="w-full flex flex-col gap-2">
                            <label htmlFor='shopNameTag' className="font-medium text-sm" >Shop Nametag</label>
                            <span className="flex items-center gap-2">
                                <input className="p-2 pl-4 text-lg bg-peach rounded-full w-[clamp(200px,100%,400px)]" 
                                    type="text"
                                    required
                                    id="shopNameTag"
                                    name="shopNameTag"
                                    onChange={handleValueChange}
                                    defaultValue={shop.shopNameTag}
                                />
                                <br className="md:hidden" />
                                <p className="text-red" style={{display: 'none'}} id="nameTagExists">Nametag already taken</p>
                            </span>
                        </div>
                    </span>
                    <span className="flex flex-col md:flex-row gap-6">
                        <div className="w-full flex flex-col gap-2">
                            <label htmlFor='optionalEmail' className="font-medium text-sm" >Public Shop Email</label>
                            <input className="p-2 pl-4 text-lg bg-peach rounded-full w-[clamp(200px,100%,400px)]" 
                                type="email"
                                id="optionalEmail"
                                name="optionalEmail"
                                onChange={handleValueChange}
                                defaultValue={shop.optionalEmail ?? ''}
                            />
                        </div>
                        <div className="w-full flex flex-col gap-2">
                            <label htmlFor='optionalPhone' className="font-medium text-sm" >Public Shop Phone Number</label>
                            <input className="p-2 pl-4 text-lg bg-peach rounded-full w-[clamp(200px,100%,400px)]" 
                            type="text" 
                            id="optionalPhone"
                            name="optionalPhone"
                                onChange={handleValueChange}
                            defaultValue={shop.optionalPhone ?? ''}
                            />
                        </div>
                    </span>
                    <div className="flex flex-col gap-2">
                        <label htmlFor='tags' className="font-medium text-sm" >Shop Search Tags</label>
                        <span className="flex gap-3 items-center">
                            <input className="p-2 pl-4 text-lg bg-peach rounded-full w-[clamp(200px,100%,400px)]" 
                            type="text" 
                            required
                            id="tags"
                            name="tags"
                            onChange={handleValueChange}
                            defaultValue={(shop.tags) ? capitalizeAll(shop.tags.join(', ')) : ''}
                            />
                            <br className="md:hidden" />
                            <p className={`${ (updatedShop.tags?.length ?? shop.tags.length) == 4 ? 'text-red' : '' }`}>{updatedShop.tags?.length ?? shop.tags.length}/4</p>
                        </span>
                    </div>

                    <span className="w-full flex flex-col md:flex-row gap-6">
                        <div className=" w-full md:w-4/12 flex flex-col gap-2">
                            <label htmlFor='buildingNum' className="font-medium text-sm" >Building Number</label>
                            <input className="p-2 pl-4 text-lg bg-peach rounded-full w-[clamp(200px,100%,400px)]" 
                            type="text" 
                            required
                            id="buildingNum"
                            name="buildingNum"
                            onChange={handleValueChange}
                            defaultValue={
                                //@ts-ignore 
                                shop.location?.buildingNum
                                ?? ''} 
                            />
                        </div>

                        <div className="w-full md:w-8/12 flex flex-col gap-2">
                            <label htmlFor='streetAddress' className="font-medium text-sm" >Street Address</label>
                            <input className="p-2 pl-4 text-lg bg-peach rounded-full w-[clamp(200px,100%,400px)]" 
                            type="text" 
                            required
                            id="streetAddress"
                            name="streetAddress"
                            onChange={handleValueChange}
                            defaultValue={
                                //@ts-ignore 
                                shop.location?.streetAddress
                                ?? ''} 
                            />
                        </div>
                    </span>
                    <span className="w-full flex flex-col md:flex-row gap-6">
                        <div className="w-full flex flex-col gap-2">
                            <label htmlFor='city' className="font-medium text-sm" >City</label>
                            <input className="p-2 pl-4 text-lg bg-peach rounded-full w-[clamp(200px,100%,400px)]" 
                            type="text" 
                            required
                            id="city"
                            name="city"
                            onChange={handleValueChange}
                            defaultValue={
                                //@ts-ignore
                                shop.location?.city ?? ''} 
                            />
                        </div>

                        <div className="w-full flex flex-col gap-2">
                            <label htmlFor='region' className="font-medium text-sm" >Region</label>
                            <input className="p-2 pl-4 text-lg bg-peach rounded-full w-[clamp(200px,100%,400px)]" 
                            type="text" 
                            required
                            id="region"
                            name="region"
                            onChange={handleValueChange}
                            defaultValue={
                                //@ts-ignore
                                shop.location?.region
                                ?? ''} 
                            />
                        </div>
                    </span>

                    <div className="w-full md:w-48 flex flex-col gap-2">
                        <label htmlFor='country' className="font-medium text-sm" >Country</label>
                        <span className="w-full relative">
                            <select id='country' className="p-2 pl-10 pr-4 bg-peach w-full rounded-full" name="country" onChange={handleValueChange} required>
                                {
                                    supportedCountries.map((country, idx) => {
                                        return (
                                            <option className="flex bg-white hover:bg-gray-50 duration-150 p-2 items-center gap-2" key={idx} selected={country.isoCode == shop.location?.country} value={country.isoCode}>
                                                <span className="ml-2">{country.name}</span>
                                            </option>
                                        )
                                    })
                                }
                            </select>
                            <span className="absolute top-[0.6rem] left-4">
                                <img className="w-[20px] h-[17px]" src={findFlagUrlByIso3Code(updatedShopLocation.country ?? shop.location?.country)} />
                            </span>
                        </span>
                    </div>
                    <div className="text-gray-400">
                        <p className="inline-block"><span className="font-bold">Last Updated:</span> <span className="hidden md:inline">{new Date(shop.updatedAt).toUTCString()}</span><span className="inline md:hidden">{new Date(shop.createdAt).toDateString()}</span></p>
                    </div>
                    <button className={`w-fit ${!valueChanged ? 'hidden': ''}`} disabled={!valueChanged || invalidValueProvided} onClick={handleUpdateShopDetails}>Save Changes</button>
                </form>
            </div>
        </>
    )
}

function PaymentsPage({shop} : {shop: IShop,}) {

    type IPlanResponse = Omit<PlanResponse, 'data'> & {
        data: IPlan[]
    }

    const [ isLoading, setLoading ] = useState<boolean>(true)
    const [ plans, setPlans ] = useState<IPlan[] | null>(null)

    useEffect( () => {
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/paystack/plan`)
        .then(res =>res.json())
        .then((planRes: IPlanResponse) => {

            if(planRes.status == false){
                popupText('We had an issue when getting your plan details')
                console.log(planRes)
                setLoading(false)
                throw new Error (`PS: ${planRes.message}`)
            }
            else {
                setPlans(planRes.data)
                setLoading(false)
            }
        })
    }, [])


    return (
        <>
            <div className="w-full">
            <div className="w-full flex flex-col gap-2 bg-gray-50 rounded-lg p-2">
                {
                    isLoading && 
                    <>
                        <div className="bg-white w-full px-4 py-2 grid place-items-center text-gray-400 animate-pulse">Loading</div>
                    </>
                }
                {
                    !isLoading && plans != null && plans.map((plan, idx) => {

                        return (
                            <div key={idx} className={`${ shop.plan == plan.plan_code ? 'bg-darkRed text-white' : 'bg-peach text-darkRed'} p-2 rounded-lg`}>
                                <h3>{plan.name.slice(8)}</h3>
                                <h4>{plan.cost}</h4>
                            </div>
                        )
                    }) 
            
                }
            </div>
            </div>

        </>
    )

}