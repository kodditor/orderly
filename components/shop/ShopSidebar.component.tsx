'use client'

import { copyToClipboard } from "@/app/utils/frontend/utils"
import { RootState } from "@/constants/orderly.store"
import { IShopCart } from "@/models/OrderProducts.model"
import { faEllipsisV, faPhone, faShareNodes, faShoppingBasket, faShoppingCart } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Dispatch, FormEventHandler, SetStateAction, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { popupText } from "../Popup.component"
import { clientSupabase } from "@/app/supabase/supabase-client"
import { TablesInsert } from "@/types/supabase"
import HCaptcha from "@hcaptcha/react-hcaptcha"
import { POPUP_STATE } from "@/models/popup.enum"


export default function ShopSideBar({ showCart, setShowCart, cart, signedInUser_id}: 
        {   
            showCart: boolean, 
            setShowCart: Dispatch<SetStateAction<boolean>>, 
            cart: IShopCart,
            signedInUser_id?: string,
        }
    ){

    const { shop } = useSelector((state: RootState) => state.shopAndUser) 
    
    const reportRef = useRef<HTMLDialogElement>(null)
    const captchaRef = useRef<HCaptcha>(null);

    const [ reportReason, setReportReason ] = useState<string>("")
    const [ reportCount, setReportCount   ] = useState<number>(0)
    const [ submitted, setSubmitted       ] = useState<boolean>(false) 
    const [ verified, setVerified         ] = useState<boolean>(false)

    //console.log(shop)

    function handleReportStore(e: any){
        e.preventDefault()

        if(!verified) return 
        if(!signedInUser_id){
            popupText('Please sign in to report the shop', POPUP_STATE.WARNING)
            reportRef.current?.close()
            return
        }
        if( reportCount >= 3){
            popupText('You have exceeded your report limit. Please try again later.', POPUP_STATE.FAILED)
            reportRef.current?.close()
            return
        }

        setSubmitted(true)
        
        const insertObject: TablesInsert<'reports'> = {
            user: signedInUser_id,
            reason: reportReason,
            shop: shop.id
        }

        clientSupabase
        .from('reports')
        .insert(insertObject)
        .select('id')
        .then(({data, error}) => {
            if(error != null){
                popupText(`SB${error.code}: An error occurred while trying to submit your report.`, POPUP_STATE.FAILED)
            } else {
                popupText(`Your report (#${data[0].id}) has been sumbitted.`, POPUP_STATE.INFO)    
                setReportCount(prev => prev + 1)
                captchaRef.current?.resetCaptcha()
            }
            reportRef.current?.close()    
            setSubmitted(false)
        })
        
    }

    if(shop.name == ''){
        return (
            <>
                <aside  className="block z-30 fixed p-5 pt-8 bg-white w-full md:w-[20vw] 2xl:w-[15vw] min-w-[240px] h-fit md:h-[calc(100%-72px)] md:top-[63px] min-h-[500px] border-r-2 border-grey-200 overflow-auto ">
                    <div className="flex flex-col gap-2 animate-pulse">
                        <div className="flex flex-row items-center md:flex-col gap-6 md:gap-4">
                            <div className=" aspect-square w-1/3 md:w-full md:m-auto md:max-w-[200px] mb-4 flex items-center rounded-full border-2 border-peach justify-center">
                                <img className="w-full saturate-0 animate-pulse" src={'/img/logo.png'} alt="The Orderly logo"/>
                            </div>
                            <div className="w-2/3 md:w-full flex flex-col gap-2">
                                <div className="w-full h-4 bg-gray-300 rounded-full"></div>
                                <div className="w-2/3 h-4 mb-2 bg-gray-300 rounded-full"></div>
                            
                                <div className="w-3/4 h-3 mb-6 bg-gray-300 rounded-full"></div>
                            </div>
                        </div>
                        <div className="w-full h-4 bg-gray-300 rounded-full"></div>
                        <div className="w-full h-4 bg-gray-300 rounded-full"></div>
                        <div className="w-full h-4 bg-gray-300 rounded-full"></div>
                        <div className="w-3/4 h-3 bg-gray-300 rounded-full mb-6"></div>
                        
                        <button className="flex items-center justify-center gap-2 mt-3 md:mt-0 w-fit md:w-full"  disabled > <FontAwesomeIcon className="mr-1" width={12} height={12} icon={faPhone} /> Contact Business</button>
                        <button className="hidden md:flex items-center justify-center gap-2 mt-3 md:mt-0 w-fit md:w-full"  disabled > <FontAwesomeIcon className="mr-1" width={12} height={12} icon={faShoppingBasket} /> View Cart</button>
                    </div>
                </aside>
            </>
        )
    } else {
        return (
            <>
                <dialog ref={reportRef} className="w-[90%] md:max-w-[400px] z-[30] shadow-md top-[20vh] fixed rounded-xl overflow-hidden">
                    <form onSubmit={handleReportStore} className="p-6 flex flex-col gap-3">
                        <h1 className="text-xl font-semibold">Report {shop.name}?</h1>
                        <p>This will notify us of any inappropriate or illegal behaviour.</p>
                        <textarea className="p-2 bg-peach rounded-xl w-full" rows={3} placeholder="Please provide details on the reasons behind your report" required onChange={(e) => {setReportReason(e.target.value)}}/>
                        <div className="w-full grid place-items-center">
                            <HCaptcha
                                ref={captchaRef}
                                sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                                onVerify={() => setVerified(true)}
                            />
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button className="w-1/2" disabled={submitted || !verified}>
                                <div style={{display: submitted ? 'block' : 'none'}} id="loading"></div>
                                <span style={{display: submitted ? 'none' : 'block'}} >Submit Report</span>
                            </button>
                            <button className="btn-secondary w-1/2" onClick={(e)=>{ e.preventDefault(); reportRef.current?.close()}}>Cancel</button>
                        </div>
                    </form>
                </dialog>
                <aside  className="block md:fixed p-4 md:p-5 md:pt-8 md:pb-2 z-30 bg-white w-full md:w-[20vw] 2xl:w-[15vw] md:min-w-[240px] md:h-[calc(100%-60px)] md:top-[63px] md:min-h-[500px] border-b-2 md:border-r-2 border-grey-200 overflow-auto ">
                    <div className="flex flex-col" >
                        <div className="flex flex-row md:flex-col items-center gap-4 md:gap-2" >
                            <div className="aspect-square w-1/3 md:w-full md:max-w-[200px] md:m-auto mb-4 flex items-center rounded-full overflow-hidden border-2 border-peach justify-center">
                                <img className="w-full" src={shop.imageURL!} alt={`The ${shop.name} logo`}/>
                            </div>
                            <div className="flex flex-col gap-1 md:gap-2">
                                <h1 className="text-2xl md:text-center font-semibold -mb-1">{shop.name}</h1>
                                <small className="text-red opacity-70 md:text-center">@{shop.shopNameTag}</small>
                                {/*@ts-ignore */}
                                <h6 className="text-md text-gray-400 font-normal md:text-center md:mb-2">{ shop.location && (shop.location.city + ", "+ shop.location.region + ", " + shop.location.country)}</h6>
                            </div>
                        </div>
                        
                        
                        <p className="mb-0 md:text-center md:mb-4">{shop.description}</p>
                        {/*}
                        <small className="mb-2 md:mb-4">{ capitalizeAll(shop.tags[0]) } • {capitalizeAll(shop.tags[1])} • {capitalizeAll(shop.tags[2])} • { capitalizeAll(shop.tags[3])}
                           
                        </small> */} 
                        <span className="flex flex-col gap-4 mt-4">
                            <span className="mt-3 md:mt-0 w-full flex items-center md:items-baseline gap-4 md:gap-2">
                                <a className="w-fit md:w-[calc(100%-30px-0.5rem)]" href={`tel:${ shop.optionalPhone}`}>
                                    <button className="btn-secondary w-full"> <FontAwesomeIcon className="mr-2" width={12} height={12} icon={faPhone} /> Contact Shop</button>
                                </a>
                                <div className=" hidden group h-[35px] relative w-[35px] md:grid place-items-center bg-gray-100 hover:bg-gray-200 duration-150 text-gray-700 cursor-pointer rounded-full">
                                    <FontAwesomeIcon width={12} height={12} icon={faEllipsisV} />
                                    <div className="absolute top-5 pt-4 right-2">
                                        <div className=" w-[130px] rounded-xl overflow-hidden hidden group-hover:flex flex-col bg-white border-2 border-gray-100">
                                            <div className="px-3 py-2 hover:bg-peach hover:text-darkRed duration-150 bg-white w-full" onClick={()=>{reportRef.current?.show()}}>Report shop</div>
                                            <div className="px-3 py-2 hover:bg-peach hover:text-darkRed duration-150 bg-white w-full" onClick={()=>{copyToClipboard(`${process.env.NEXT_PUBLIC_BASE_URL}/s/${shop.shopNameTag}`) ? popupText('Link copied!', POPUP_STATE.INFO): null}}>Share Link</div>
                                        </div>
                                    </div>
                                </div>
                                <span className="md:hidden h-[30px] w-[30px] grid place-items-center text-gray-600 rounded-full bg-gray-100 hover:bg-gray-200" onClick={()=>{copyToClipboard(`${process.env.NEXT_PUBLIC_BASE_URL}/s/${shop.shopNameTag}`) ? popupText('Link copied!', POPUP_STATE.INFO): null}}>
                                    <FontAwesomeIcon width={12} height={12} icon={faShareNodes} />
                                </span>
                                <p className="md:hidden text-gray-600 font-medium" onClick={()=>{reportRef.current?.show()}}>
                                    Report Shop
                                </p>
                            
                            </span>
                            <button className="hidden md:flex items-center justify-center gap-2 mt-3 md:mt-0 w-fit md:w-full" onClick={()=>setShowCart(true)}> <FontAwesomeIcon className="mr-1" width={15} height={15} icon={faShoppingCart} /> My Cart ({cart.products?.length})</button>
                        </span>
                    </div>
                </aside>
            </>
        )
    }

}