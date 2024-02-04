import { clientSupabase } from "@/app/supabase/supabase-client"
import { fadePages, pesewasToCedis } from "@/app/utils/frontend/utils"
import { IOrderResponse, IShopCart } from "@/models/OrderProducts.model"
import { IUserMetadataWithIDAndEmail } from "@/models/user.model"
import { Tables, TablesInsert } from "@/types/supabase"
import { faArrowLeft, faMinus, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { toNumber } from "lodash"
import { Dispatch,  FormEvent,  RefObject, SetStateAction, useRef, useState } from "react"
import { popupText } from "../Popup.component"
import { IShop } from "@/models/shop.model"

export default function ShopCart({cart, showCart, setShowCart, allProducts, removeFromCart, addToCart, setCart, shop, setOrderResponse}: 
        {
            showCart: boolean,
            setShowCart: Dispatch<SetStateAction<boolean>>,
            cart: IShopCart,
            allProducts: Tables<'products'>[]
            removeFromCart: (product: Tables<'products'>, removeAll?:boolean) => void,
            addToCart: (product: Tables<'products'>) => void,
            setCart: Dispatch<SetStateAction<IShopCart>>,
            shop: IShop
            setOrderResponse: Dispatch<SetStateAction<IOrderResponse|null>>
        }){

    const cartRef = useRef<HTMLDivElement>(null)
    const checkoutRef = useRef<HTMLDivElement>(null)
    const confirmationRef = useRef<HTMLDivElement>(null)
    const parentRef = useRef<HTMLDivElement>(null)
    
    const [ isSendingOrder, setIsSendingOrder ] = useState<boolean>(false)

    function changePageTo(currentRef:RefObject<HTMLDivElement> , nextRef:RefObject<HTMLDivElement>){
        fadePages(parentRef)
        setTimeout(()=>{
            currentRef.current!.style.display = 'none'
            nextRef.current!.style.display = 'flex'
        }, 250)
        
    }
    
    async function handleFinalizeOrder(e: any){

        setIsSendingOrder((prev)=>true)

        e.preventDefault()
        if(cart.shopper.shopper_user_id){ // The person is already an orderly user.
            
            clientSupabase
            .from

        } else { // The person is not an orderly user.
            clientSupabase
            .from('locations')
            .insert(cart.shopper.location)
            .select()
            .then(({data, error}) => {
                if(error){
                    console.log(error)
                    setIsSendingOrder(false)
                    popupText(`SB${error.code}: Oops! An error occurred, please try again in 5 minutes.`)
                } else {
                    let location = data[0]
                    clientSupabase
                    .from('shopper_details')
                    .insert({
                        firstName: cart.shopper.shopperFirstName,
                        lastName: cart.shopper.shopperLastName,
                        phone:cart.shopper.phone,
                        shopper_user_id: null,
                        location: location.id
                    })
                    .select()
                    .then(({data, error}) =>{
                        if(error){
                            console.log(error)
                            setIsSendingOrder(false)
                            popupText(`SB${error.code}: Oops! An error occurred, please try again in 5 minutes.`)
                        } else {
                            let shopper= data[0]
                            //@ts-ignore
                            shopper.location = location
                            let orderObj: TablesInsert<'orders'> = {
                                shop_id: shop.id,
                                shopper: data[0].id,
                                shopper_user_id: null,
                                status: "SENT"
                            }

                            clientSupabase
                            .from('orders')
                            .insert(orderObj)
                            .select()
                            .then(({data, error}) =>{
                                if(error){
                                    console.log(error)
                                    setIsSendingOrder(false)
                                    popupText(`SB${error.code}: Oops! An error occurred, please try again in 5 minutes.`)
                                } else {
                                    //@ts-ignore
                                    let orderDetails = data[0] as IOrderResponse
                                    orderDetails.shopper = shopper

                                    let insertProducts: TablesInsert<'order_products'>[] = cart.products.map((prodObj) =>{
                                        return {
                                            product: prodObj.product_id,
                                            price: prodObj.price,
                                            quantity: prodObj.quantity,
                                            order: orderDetails.id 
                                        }
                                    })
                                    
                                    clientSupabase
                                    .from('order_products')
                                    .insert(insertProducts)
                                    .select()
                                    .then(({ data, error }) =>{
                                        if(error){
                                            console.log(error)
                                            setIsSendingOrder(false)
                                            popupText(`SB${error.code}: Oops! An error occurred, please try again in 5 minutes.`)
                                        } else {
                                            orderDetails.products = data
                                            setOrderResponse(orderDetails)
                                            setIsSendingOrder(false)
                                            popupText('Order submitted!')
                                        } 
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    }

    function handleValueChange(e: any){
        let field = e.target.field
        let value = e.target.value

        if(value === null || field === null) return

        switch (field) {
            case 'firstName':
            case 'lastName':
            case 'phone':
                setCart((prev) => {
                    return ({
                        ...prev,
                        shopper: {
                            ...prev.shopper,
                            [field]: value
                        }
                    })
                })
                break;

            case 'city':
            case 'buildingNum':
            case 'streetAddress':
            case 'region':
            case 'country':
                setCart((prev) => {
                    return ({
                        ...prev,
                        shopper: {
                            ...prev.shopper,
                            location: {
                                ...prev.shopper.location,
                                [field]: value
                            }
                        }
                    })
                })
                break;
            default:
                break;
        }

    }

    if(showCart){
        
        let total = 0
        if(cart.products.length != 0){
            for (let i = 0; i < cart.products.length; i++ ){
                total += cart.products[i].price * cart.products[i].quantity
            }
        }

        return (
            <>
                <div className="z-[51] top-0 left-0 fixed w-screen flex flex-col md:flex-row h-screen">
                    <div className="w-full md:w-[50%] h-[30%] md:h-full bg-gray-400 opacity-40" onClick={()=>{setShowCart(false)}}></div>
                    <div  className="bg-white opacity-100 shadow-lg w-full md:mt-0 md:w-[50%] h-[70%] overflow-y-auto md:h-full p-4 pt-6 md:pt-16 md:p-16 ">
                        <div className="w-full h-full" ref={parentRef}>
                            { /* Cart Page */}
                            <div ref={cartRef} className="flex flex-col justify-between h-[calc(100%-1rem)] md:h-[calc(100%-4rem)]">
                                <div className="h-fit max-h-[calc(45vh)] md:max-h-[calc(70vh)] mb-8 md:mb-10">
                                    <h1 className="text-3xl font-bold">My Cart <span className="text-gray-400 ml-1 md:ml-3 text-xl">({cart.products.length} items)</span></h1>
                                    <div className="mt-4 rounded-lg w-full p-2 h-fit max-h-[calc(100%-2rem)] overflow-y-auto flex flex-col bg-gray-100">

                                        { 
                                            cart.products.length === 0 && 
                                            <>
                                                <p className="text-center text-gray-500">There are no products in your cart</p>
                                            </>
                                        }


                                        { 
                                            cart.products.length > 0 && cart.products.map( (product, idx) =>{
                                                
                                                let specificProduct = allProducts.find((prod) => prod.id == product.product_id) as Tables<'products'>

                                                return (
                                                    <div className="group rounded-lg duration-150 relative bg-white p-2 md:p-4 mb-4 last:mb-0 gap-4 flex items-center" key={idx}>
                                                        <span className="h-[120px] md:h-[100px] w-[120px] md:w-[100px] aspect-square rounded-xl border-2 border-gray-200 overflow-hidden flex justify-center items-center">
                                                            <img src={specificProduct?.imageURL!} />
                                                        </span>
                                                        <div className="w-[calc(100%-100px)] flex flex-col md:flex-row md:justify-between gap-0 md:gap-2">
                                                            <h1 className="text-lg leading-5 md:leading-normal -mb-1 md:mb-0">{specificProduct?.name}</h1>
                                                            <span className="flex flex-col md:flex-row md:items-center gap-0 md:gap-4">
                                                                <small className="text-gray-400">x{product.quantity}</small>
                                                                <h3 className="font-bold text-lg">GHS{pesewasToCedis(product.price).toFixed(2)}</h3>
                                                            </span>
                                                            <div className="flex md:hidden gap-2">
                                                                <div className={`bg-gray-200 text-gray-700 hover:bg-darkRed hover:text-white flex cursor-pointer duration-150  w-8 h-8  top-1 rounded-lg  overflow-hidden items-center justify-center`} onClick={()=>{addToCart(specificProduct)}}>
                                                                    <FontAwesomeIcon width={12} height={12} icon={faPlus} />
                                                                </div> 
                                                                <div className={`${ product.quantity <= 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-darkRed hover:text-white' } flex cursor-pointer duration-150  w-8 h-8  top-1 rounded-lg  overflow-hidden items-center justify-center`} onClick={()=>{ product.quantity <= 1 ? null : removeFromCart(specificProduct)}}>
                                                                    <FontAwesomeIcon width={12} height={12} icon={faMinus} />
                                                                </div>
                                                                <div className="cursor-pointer duration-150 hover:bg-red hover:text-white w-8 h-8 text-gray-700 top-1 rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center" onClick={()=>removeFromCart(specificProduct, true)}>
                                                                    <FontAwesomeIcon width={12} height={12} icon={faTrash} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="hidden  md:group-hover:flex absolute top-1 right-1 gap-2">
                                                            <div className={`bg-gray-200 text-gray-700 hover:bg-darkRed hover:text-white flex cursor-pointer duration-150  w-8 h-8  top-1 rounded-lg  overflow-hidden items-center justify-center`} onClick={()=>{addToCart(specificProduct)}}>
                                                                <FontAwesomeIcon width={12} height={12} icon={faPlus} />
                                                            </div> 
                                                            <div className={`${ product.quantity <= 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-darkRed hover:text-white' } flex cursor-pointer duration-150  w-8 h-8  top-1 rounded-lg  overflow-hidden items-center justify-center`} onClick={()=>{ product.quantity <= 1 ? null : removeFromCart(specificProduct)}}>
                                                                <FontAwesomeIcon width={12} height={12} icon={faMinus} />
                                                            </div>
                                                            <div className="cursor-pointer duration-150 hover:bg-red hover:text-white w-8 h-8 text-gray-700 top-1 rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center" onClick={()=>removeFromCart(specificProduct, true)}>
                                                                <FontAwesomeIcon width={12} height={12} icon={faTrash} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )

                                            })

                                        }

                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row gap-2 md:gap-4 md:items-end mt-3 md:mt-2" >
                                    <span className="w-full md:w-1/3">
                                        <small className="text-red mb-1">Total</small>
                                        <span className="flex gap-1 items-baseline">
                                            <small className="text-md mb-[3px]">GHS</small>
                                            {/*@ts-ignore*/}
                                            <h2 className="text-3xl mb-0 font-extrabold">{pesewasToCedis(total).toFixed(2).toLocaleString() }</h2>
                                        </span>
                                    </span>
                                    <div className="w-full flex gap-2 md:gap-4 mb-4 mt-2 md:mt-0 md:mb-0 items-center md:items-end" >
                                        <span  className="w-1/2" >
                                            <button className="w-full" disabled={cart.products.length === 0} onClick={()=>{changePageTo(cartRef, checkoutRef)}}>Checkout</button>
                                        </span>
                                        <span  className="w-1/2" >
                                            <button className=" btn-secondary w-full" onClick={()=>{setShowCart(false)}}>Close</button>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            { /* Checkout Page */}
                            <div ref={checkoutRef} style={{display: 'none'}} className="flex flex-col justify-between h-[calc(100%-1rem)] md:h-[calc(100%-4rem)]">
                                <div className="h-fit max-h-[calc(45vh)] md:max-h-[calc(70vh)] mb-8 md:mb-10">
                                    <span className="w-fit group mb-3 md:mb-4 flex gap-1 cursor-pointer items-center py-2 px-4 rounded-full bg-gray-100 hover:bg-gray-200 duration-150" onClick={()=>{changePageTo(checkoutRef, cartRef)}}>
                                        <FontAwesomeIcon className="w-7 flex items-center justify-center duration-150 group-hover:mr-1 mr-0" icon={faArrowLeft} />
                                        <p>Back</p>
                                    </span>
                                    <h1 className="text-3xl font-bold mb-3">Enter your delivery details</h1>
                                    <form onSubmit={(e)=>{e.preventDefault()}} className="flex flex-col gap-2 md:gap-4">
                                        <span className="flex flex-col md:flex-row gap-2 md:gap-4 ">
                                            <span className="flex flex-col w-full md:w-1/2">
                                                <label className="mb-1 md:mb-2 text-sm" htmlFor="firstName">First Name</label>
                                                <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="First Name" type="text" id='firstName' name="firstName" defaultValue={cart.shopper.shopperFirstName}  maxLength={50} onChange={handleValueChange} required/>
                                            </span>
                                            <span className="flex flex-col w-full md:w-1/2">
                                                <label className="mb-1 md:mb-2 text-sm" htmlFor="lastName">Last Name</label>
                                                <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Last Name" type="text" id='lastName' name="lastName" defaultValue={cart.shopper.shopperLastName}  maxLength={50} onChange={handleValueChange} required/>
                                            </span>
                                        </span>
                                        <span className="flex flex-col md:flex-row gap-2 md:gap-4 ">
                                            <span className="flex flex-col w-full md:w-3/12">
                                                <label className="mb-1 md:mb-2 text-sm" htmlFor="buildingNum">Building Number</label>
                                                <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Building Number" type="text" id="buildingNum" name="buildingNum" defaultValue={cart.shopper.location.buildingNum}  maxLength={50} onChange={handleValueChange} />
                                            </span>
                                            <span className="flex flex-col w-full md:w-9/12">
                                                <label className="mb-1 md:mb-2 text-sm" htmlFor="streetAddress">Street Address</label>
                                                <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Street Address" type="text" id='streetAddress' name="streetAddress" defaultValue={cart.shopper.location.streetAddress} maxLength={50} onChange={handleValueChange} required/>
                                            </span>
                                        </span>
                                        <span className="flex flex-col md:flex-row gap-4 ">
                                            <span className="flex flex-col w-full md:w-1/2">
                                                <label className="mb-1 md:mb-2 text-sm" htmlFor="city">City</label>
                                                <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="City" type="text" id='city' name="city" defaultValue={cart.shopper.location.city}  maxLength={50} onChange={handleValueChange} required/>
                                            </span>
                                            <span className="flex flex-col w-full md:w-1/2">
                                                <label className="mb-1 md:mb-2 text-sm" htmlFor="region">Region</label>
                                                <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Region" type="text" id='region' name="region" defaultValue={cart.shopper.location.region}  maxLength={50} onChange={handleValueChange} required/>
                                            </span>
                                        </span>
                                        <span className="flex flex-col">
                                            <label className="mb-1 md:mb-2 text-sm" htmlFor="country">Country</label>
                                            <input className="p-2 pl-4 bg-peach rounded-full w-full" placeholder="Country" type="text" id='country' name="country" defaultValue={cart.shopper.location.country}  maxLength={50} onChange={handleValueChange} required/>
                                        </span>
                                        <div className="flex flex-col md:flex-row gap-2 md:gap-4 md:items-end mt-3 md:mt-2" >
                                            <span  className="w-full md:w-1/2" >
                                                <button className="w-full">Confirm Details</button>
                                            </span>
                                            <span  className="w-full pb-4 md:pb-0 md:w-1/2" >
                                                <button className=" btn-secondary w-full" onClick={(e)=>{setShowCart(false)}}>Close</button>
                                            </span>
                                        </div>
                                    </form> 
                                </div>
                            </div>
                            { /* Order Confirmation */}
                            <div ref={confirmationRef} style={{display: 'none'}} className="flex flex-col justify-between h-[calc(100%-1rem)] md:h-[calc(100%-4rem)]">
                                <div className="h-fit max-h-[calc(45vh)] md:max-h-[calc(70vh)] mb-8 md:mb-10">
                                    <span className="w-fit group mb-3 md:mb-4 flex gap-1 cursor-pointer items-center py-2 px-4 rounded-full bg-gray-100 hover:bg-gray-200 duration-150" onClick={()=>{changePageTo(confirmationRef,checkoutRef)}}>
                                        <FontAwesomeIcon className="w-7 flex items-center justify-center duration-150 group-hover:mr-1 mr-0" icon={faArrowLeft} />
                                        <p>Back</p>
                                    </span>
                                    <h1 className="text-3xl font-bold mb-3">Order Confirmation</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}