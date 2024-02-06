"use client"
import type { RootState } from "@/constants/orderly.store"
import { faArrowLeft, faArrowRight, faExternalLink, faExternalLinkSquare, faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { MutableRefObject, RefObject, forwardRef, useRef, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { capitalizeAll, fadePages, getCSV } from "@/app/utils/frontend/utils"
import { IShop } from "@/models/shop.model"
import { popupText } from "@/components/Popup.component"
import { clientSupabase } from "@/app/supabase/supabase-client"
import { Database, Tables, TablesUpdate } from "@/types/supabase"
import { setShop } from "@/constants/orderly.slice"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { Dispatch } from "@reduxjs/toolkit"
import { IUserMetadataWithIDAndEmail } from "@/models/user.model"


export default function SettingsTabComponent(){

    const {shop, user, products} = useSelector((state: RootState) => state.shopAndUser) 
    const dispatch = useDispatch()

    const router = useRouter()

    const searchParams = useSearchParams()
    const section = searchParams.get('section')

    const settingsParentRef = useRef<HTMLDivElement>(null)

    const defaultPageRef = useRef<HTMLDivElement>(null) 
    const shopPageRef = useRef<HTMLDivElement>(null) 
    
    const [ currentPage, setCurrentPage] = useState<RefObject<HTMLDivElement>>(defaultPageRef)

    const allPageRefs :{[key: string] : RefObject<HTMLDivElement>} = {
        'default': defaultPageRef,
        'my-shop': shopPageRef
    }

    function changePageTo(nextRefName:string){
        fadePages(settingsParentRef)
        setTimeout( ()=>{
            currentPage.current!.style.display = 'none'
            allPageRefs[nextRefName]!.current!.style.display = 'block'
            setCurrentPage(allPageRefs[nextRefName]) // Pray if this doesn't exist
        }, 250)
    }
 
    if(!user){
        router.push('/s/dashboard')
    }
    else {
        if(section == '' || section == null){
            return (
                <>
                    <div className="mb-4 md:mb-8 flex w-full md:w-[calc(75%+8rem)] justify-between">
                        <h1 className="font-bold text-2xl">My Settings</h1>
                        <span className=" group flex gap-1 cursor-pointer items-center py-2 px-4 rounded-full bg-gray-100 hover:bg-gray-200 duration-150" style={{display: (currentPage == defaultPageRef) ? 'none': 'flex'}} onClick={()=>{changePageTo('default')}}>
                            <FontAwesomeIcon className="w-7 flex items-center justify-center duration-150 group-hover:mr-1 mr-0" icon={faArrowLeft} />
                            <p>Back</p>
                        </span>
                    </div>
                    <div className="mb-8 w-full md:w-[calc(75%+8rem)]" ref={settingsParentRef}>
                        <DefaultSettingsPage 
                            divRef={defaultPageRef} 
                            changePageTo={changePageTo}
                            shop={shop}
                            router={router}
                        />

                        <MyShopSettingsPage 
                            divRef={shopPageRef} 
                            changePageTo={changePageTo}
                            shop={shop} 
                            router={router}
                            dispatch={dispatch}
                            user={user}
                        />

                    </div>
                </>
            )    
        }
    }
}

function DefaultSettingsPage({divRef, changePageTo, shop, router }: {divRef:RefObject<HTMLDivElement>, changePageTo: any, shop: IShop, router: AppRouterInstance}){

    const deleteDialogRef = useRef<HTMLDialogElement>(null)

    function handleDeleteShop(e:any){
        e.preventDefault()
        let confirmationValue = e.target[0].value
        //console.log(confirmationValue, shop.shopNameTag, typeof(confirmationValue), typeof(shop.shopNameTag))
        if (confirmationValue === shop.shopNameTag){
            //console.log(confirmationValue)
            
            clientSupabase
            .from('shops')
            .delete()
            .eq('id', shop.id)
            .then(({ error }) => {
                if(!error){
                    router.push('/')
                    popupText(`${shop.name} deleted.`)
                } else {
                    console.error(error)
                    popupText('An error occurred.')

                }

            })
        }
    }

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
            <div ref={divRef}>   
                <section className="w-full md:w-[calc(75%+8rem)] mb-8" >
                    <h3 className="text-gray-500 text-sm mb-4">GENERAL</h3>
                    <div className="mb-8">
                        <DefaultSettingOption 
                            changePageTo={changePageTo} 
                            changePageToDest='my-shop'
                            title="My Shop"
                        />
                        {/*
                        <DefaultSettingOption 
                            changePageTo={changePageTo} 
                            changePageToDest=''
                            title="Deliveries"
                        />
                       <DefaultSettingOption 
                            changePageTo={changePageTo} 
                            changePageToDest=''
                            title="Payments & Finances"
                        />
                        <DefaultSettingOption 
                            changePageTo={changePageTo} 
                            changePageToDest=''
                            title="Legal and Compliance"
                        />
                        */}
                    </div>
                    <h3 className="text-gray-500 text-sm mb-4">USER</h3>
                    <div>
                        <DefaultSettingOption 
                            changePageTo={changePageTo} 
                            changePageToDest=''
                            title="Account Management (awaiting implementation)"
                        />
                        {/*
                        <DefaultSettingOption 
                            changePageTo={changePageTo} 
                            changePageToDest=''
                            title="Notifications"
                        />
                        */}
                    </div>
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

function MyShopSettingsPage(
    { 
        divRef, 
        changePageTo, 
        shop, 
        user,
        router, 
        dispatch
    }
    : {
        divRef:RefObject<HTMLDivElement>, 
        changePageTo: any, 
        shop: IShop, 
        router:AppRouterInstance,
        user: IUserMetadataWithIDAndEmail 
        dispatch:Dispatch
    }){

    const [valueChanged, setValueChanged] = useState<boolean>(false)
    const [invalidValueProvided, setInvalidValueProvided] = useState<boolean>(false)

    const [updatedShop, setUpdatedShop] = useState<TablesUpdate<'shops'>>({})

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
                setUpdatedShop( (prev) =>{
                    return (
                        {
                            ...prev,
                            location: {
                                //@ts-ignore
                                aptNum: shop.location?.aptNum,
                                //@ts-ignore
                                city: shop.location?.city,
                                //@ts-ignore
                                streetAddress: shop.location?.streetAddress,
                                //@ts-ignore
                                region: shop.location?.region,
                                //@ts-ignore
                                country: shop.location?.country,
                                [field]: value
                            }
                        }
                    )
                })

                break;

            case 'shopNameTag':

                console.log(value)

                if(value = shop.shopNameTag){
                    return
                }

                clientSupabase
                .from('shops')
                .select('shopNameTag')
                .eq('shopNameTag', value)
                .then((res)=>{
                    if(res.error){
                        popupText(`SB${res.error.code} An error occurred. Try again later.`)
                        console.log(res.error)
                    }

                    if(res.data?.length != 0){
                        popupText('Please choose another name tag')
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
            popupText('Shop was not updated, nothing changed.')
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

        supabase.from('shops')
        .update(updateObject)
        .eq('id', shop.id)
        //.eq('user_id', user.id)
        .select()
        .then( ({data, error}) =>{
            if(!error){
                //console.log(data[0], error, shop.id)
                popupText("Shop Updated Successfully")
                //@ts-ignore
                dispatch(setShop(data[0])) 
                setTimeout(() => router.push('/s/dashboard'), 1500)
                      
            } else {
                popupText(`SB${error.code}: An error occurred. Please try again later.`)
                console.error(error)
            }
        })

    }

    return (
        <>
            <div className="w-full hidden" ref={divRef}>
                <h1 className="text-3xl mb-2">Shop Details</h1>
                <form className="flex flex-col gap-6" onSubmit={(e)=>e.preventDefault()}>
                    <div className="flex flex-col gap-2">
                        <label htmlFor='name' className="ml-2 font-bold">Shop Name</label>
                        <input className="p-2 pl-4 text-lg bg-peach rounded-full w-[clamp(200px,100%,400px)]" 
                            type="text" 
                            required 
                            id="name"
                            name="name"
                            onChange={handleValueChange}
                            defaultValue={shop.name} 
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor='shopNameTag' className="ml-2 font-bold">Shop Nametag</label>
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
                    <div className="flex flex-col gap-2">
                        <label htmlFor='optionalEmail' className="ml-2 font-bold">Public Shop Email</label>
                        <input className="p-2 pl-4 text-lg bg-peach rounded-full w-[clamp(200px,100%,400px)]" 
                            type="email" 
                            id="optionalEmail"
                            name="optionalEmail"
                            onChange={handleValueChange}
                            defaultValue={shop.optionalEmail ?? ''} 
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor='optionalPhone' className="ml-2 font-bold">Public Shop Phone Number</label>
                        <input className="p-2 pl-4 text-lg bg-peach rounded-full w-[clamp(200px,100%,400px)]" 
                        type="text" 
                        id="optionalPhone"
                        name="optionalPhone"
                            onChange={handleValueChange}
                        defaultValue={shop.optionalPhone ?? ''} 
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor='tags' className="ml-2 font-bold">Shop Search Tags</label>
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
                    <div className="flex flex-col gap-2">
                        <label htmlFor='city' className="ml-2 font-bold">City</label>
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

                    <div className="flex flex-col gap-2">
                        <label htmlFor='buildingNum' className="ml-2 font-bold">Building Number</label>
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

                    <div className="flex flex-col gap-2">
                        <label htmlFor='streetAddress' className="ml-2 font-bold">Street Address</label>
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
                        
                    <div className="flex flex-col gap-2">
                        <label htmlFor='region' className="ml-2 font-bold">Region</label>
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

                    <div className="flex flex-col gap-2">
                        <label htmlFor='country' className="ml-2 font-bold">Country</label>
                        <input className="p-2 pl-4 text-lg bg-peach rounded-full w-[clamp(200px,100%,400px)]" 
                        type="text" 
                        required
                        id="country"
                        name="country"
                        onChange={handleValueChange}
                        defaultValue={ 
                            //@ts-ignore
                            shop.location?.country
                            ?? ''} 
                        />
                    </div>
                    <div className="ml-1 mb-2 text-gray-400">
                        <p className="mr-4 inline-block"><span className="font-bold">Date Created:</span> <span className="hidden md:inline">{new Date(shop.createdAt).toUTCString()}</span><span className="inline md:hidden">{new Date(shop.createdAt).toDateString()}</span></p>
                        <p className="inline-block"><span className="font-bold">Last Updated:</span> <span className="hidden md:inline">{new Date(shop.updatedAt).toUTCString()}</span><span className="inline md:hidden">{new Date(shop.createdAt).toDateString()}</span></p>
                    </div>
                    <button className="w-fit" disabled={!valueChanged || invalidValueProvided} onClick={handleUpdateShopDetails}>Save Changes</button>
                </form>
            </div>

        </>
    )

}

function DefaultSettingOption({ changePageTo, changePageToDest, title}: { changePageTo: any, changePageToDest: string ,title:string}){

    return (
        <>
            <div className="group cursor-pointer rounded-lg flex mb-4 justify-between items-center px-4 py-2 hover:bg-gray-100 duration-150 border-2 border-gray-100" onClick={()=>changePageTo(changePageToDest)}>
                <h2 className="text-xl">{title}</h2>
                <span className="w-10 h-10 bg-peach rounded-full flex items-center justify-center duration-150 group-hover:mr-0 mr-3">
                    <FontAwesomeIcon className="w-7" icon={faExternalLink} />
                </span>
            </div>
        </>
    )
}