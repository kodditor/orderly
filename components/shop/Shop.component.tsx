'use client'

import { useDispatch, useSelector } from "react-redux"
import { setShop, setProducts } from "@/constants/orderly.slice"
import { IShop } from "@/models/shop.model"
import Header from "../Header.component"
import Footer from "../Footer.component"
import { RootState } from "@/constants/orderly.store"
import { SetStateAction, useEffect, useState } from "react"
import { clientSupabase } from "@/app/supabase/supabase-client"
import ShopSideBar from "./ShopSidebar.component"
import { capitalizeAll,  pesewasToCedis, styledCedis } from "@/app/utils/frontend/utils"
import ProductItem from "./ProductItem.component"
import { Tables } from "@/types/supabase"
import { useSearchParams } from "next/navigation"
import { IOrderProducts, IOrderResponse, IShopCart } from "@/models/OrderProducts.model"
import { v4 } from "uuid"
import ShopCart from "./ShopCart.component"
import { faMinus, faPlus, faShoppingCart } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export default function Shop({selectedShop}: {selectedShop: IShop})
{
    const {shop, user, products} = useSelector((state: RootState) => state.shopAndUser) 

    const [ dataLoading, setLoading ] = useState<boolean>(true)
    const [ genError, setError ] = useState<boolean>(false)

    const supabase = clientSupabase

    const [ selectedProduct , setSelectedProduct ] = useState<Tables<'products'> | null>(null)
    const [ showProduct, setShowProduct          ] = useState<boolean>(false)
    const [ showCart, setShowCart                ] = useState<boolean>(false)

    
    const [ cart, setCart                        ] = useState<IShopCart>({
                                                                            id: v4(),
                                                                            products: [],
                                                                            shopper: {
                                                                                shopperFirstName: user?.firstName,
                                                                                shopperLastName: user?.lastName,
                                                                                location: {
                                                                                    city: user.location?.city ?? "",
                                                                                    buildingNum: user.location?.buildingNum ?? "",
                                                                                    region: user.location?.region ?? "",
                                                                                    country: user.location?.country ?? "",
                                                                                    streetAddress: user.location?.streetAddress ?? ""
                                                                                },
                                                                                phone: user.phoneNumber ?? "",
                                                                                shopper_user_id: user?.id ?? null
                                                                            }
                                                                        })

    const dispatch = useDispatch()

    const searchParams = useSearchParams()
    const pathProductVariable = searchParams.get('product')

    useEffect(()=>{
        dispatch(setShop(selectedShop))
        supabase
        .from('products')
        .select('*')
        .eq('shop_id', selectedShop.id)
        .then(({data, error}) =>{
            if(!error){
                dispatch(setProducts(data!))
                if(pathProductVariable){
                    let product = data.find((product)=>{return (product.id == pathProductVariable)})
                    //@ts-ignore
                    product ? showProductItem(product) : null
                }
                setLoading(false)
            } else {
                setError(true)
                setLoading(false)
            }
        })

        

    }, [selectedShop])

    function ArrayExistsAndHasLengthLargerThanTwo(array : any[] | null){

        if (array != null) return array.length != 0 &&  array.at(0) != ''  && array.length > 2 // sorry you had to read this
        return false
    }

    function ArrayExistsAndHasLengthLessThanOrEqualToThree(array : any[] | null){

        if (array != null) return array.length != 0 &&  array.at(0) != ''  && array.length <= 2 // sorry you had to read this too
        return false
    }

    function showProductItem(product: Tables<'products'>){
        setSelectedProduct(product)
        setShowProduct(true)
    }

    function addToCart(product: Tables<'products'>){
        if(product == null) return

        let addedProductIndex = cart.products.findIndex((prodObj)=>prodObj.product_id === product.id)
        

        if(addedProductIndex != -1){ // Product already exists in cart
            let addedProduct = cart.products[addedProductIndex]
            addedProduct = {
                ...addedProduct,
                quantity: addedProduct.quantity + 1
            }

            setCart((prev) => { 
                prev.products.splice(addedProductIndex, 1, addedProduct)
                return ({
                    ...prev
                })
            }
            )

        } else { // product does not exist in cart

            let newCartItem:IOrderProducts = {
                product_id: product.id,
                price: product.price!,
                quantity: 1
            }

            setCart((prev) => { return ({
                    ...prev,
                    products: [
                        ...prev.products,
                        newCartItem
                    ]
                })
            }
            )
        }
        //console.log(cart)
    }

    function removeFromCart(product: Tables<'products'>, removeAll? :boolean){
        if(product == null) return

        let addedProductIndex = cart.products.findIndex((prodObj)=>prodObj.product_id === product.id)
        
        if(addedProductIndex == -1) return // product does not exist in cart

        let addedProduct = cart.products[addedProductIndex]
        // Product already exists in cart
        addedProduct = {
            ...addedProduct,
            quantity: removeAll ? 0 : addedProduct.quantity - 1
        }

        if (addedProduct.quantity == 0){ // There was only one item
            setCart((prev) => {
                return ({
                    ...prev,
                    products: [
                        ...prev.products.filter((prodObj) => prodObj.product_id !== addedProduct!.product_id)
                    ]
                })
            }
            )
        } else { //There was more than one item

            setCart((prev) => { 
                prev.products.splice(addedProductIndex, 1, addedProduct)

                return ({
                    ...prev
                })
            }
            )
        }   
        //console.log(cart.products)
    }

    function clearCart(){

        setCart(
            {
                id: v4(),
                products: [],
                shopper: {
                    shopperFirstName: user?.firstName,
                    shopperLastName: user?.lastName,
                    location: {
                        city: user.location?.city ?? "",
                        buildingNum: user.location?.buildingNum ?? "",
                        region: user.location?.region ?? "",
                        country: user.location?.country ?? "",
                        streetAddress: user.location?.streetAddress ?? ""
                    },
                    phone: user.phoneNumber ?? "",
                    shopper_user_id: user?.id ?? null
                }
            }
        )

        // cookie implementation as well

    }

    return(
        <>
            <Header />
            <ShopSideBar
                showCart={showCart}
                setShowCart={setShowCart} 
                cart={cart}
            />
            <ProductItem 
                isOpen={showProduct} 
                product={selectedProduct}
                allProducts={cart.products}
                removeFromCart={removeFromCart}
                addToCart={addToCart} 
                setIsOpen={setShowProduct} 
            />
            <ShopCart 
                showCart={showCart} 
                setShowCart={setShowCart}
                cart={cart} 
                allProducts={products} 
                addToCart={addToCart}
                removeFromCart={removeFromCart}
                setCart={setCart}
                shop={shop}
                clearCart={clearCart}     
            />
            
            <main className="w-[100%] pb-8 md:pl-[20vw] md:min-h-[calc(100vh-138px)]">
                <div className="w-full md:w-3/4 overflow-x-hidden h-full p-4 md:p-8">
                    <h1 className="font-bold text-2xl md:text-3xl mb-4 md:mb-8">{products?.length + ' '}Product<span style={{display: (products?.length === 1) ? 'none' : 'inline'}}>s</span></h1>
                    <section className="bg-gray-100 rounded-lg p-2 md:p-4 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 w-full">
                        { products.length == 0 && 
                            <>
                                <p>This shop has no products.</p>
                            </> 
                        }
                        { products.length != 0 && products.map((product, idx) =>{

                            let productIndexInCart: number | null = null
                            if( cart.products.length == 0){null}
                            else {
                                for (let i = 0; i < cart.products.length; ++i){
                                    if(cart.products[i].product_id === product.id){
                                        productIndexInCart = i
                                    }
                                }
                            }

                            return (
                                <div className="bg-white cursor-pointer text-black rounded-xl flex flex-col p-3 md:p-4 w-full duration-150 hover:shadow-md" key={idx} onClick={()=>showProductItem(product)}>
                                    <div className="flex gap-2 md:gap-4 h-full flex-col">
                                        <span className="w-full aspect-square rounded-xl overflow-hidden flex justify-center items-center">
                                            <img src={product.imageURL!} />
                                        </span>
                                        <div className="h-1/3 flex flex-col gap-2 justify-between">
                                            <div>
                                                <h2 className="text-lg mb-2">{product.name}</h2>
                                                <div className="w-full overflow-auto hidden md:flex gap-1">
                                                {   
                                                    ArrayExistsAndHasLengthLessThanOrEqualToThree(product.variations) && <>
                                                            
                                                        <small className="bg-peach whitespace-nowrap rounded-xl py-1 px-2" >{capitalizeAll(product.variations![0])}</small>
                                                        <small className="bg-peach whitespace-nowrap rounded-xl py-1 px-2" >{capitalizeAll(product.variations![1])}</small>
                                                            
                                                    </>
                                                }
                                                
                                                {
                                                     ArrayExistsAndHasLengthLargerThanTwo(product.variations) && ( (product.variations![0] + product.variations![0]).length < 15 ) && <>
                                                        <small className="bg-peach whitespace-nowrap rounded-xl py-1 px-2" >{capitalizeAll(product.variations![0])}</small>
                                                        <small className="bg-peach whitespace-nowrap rounded-xl py-1 px-2" >{capitalizeAll(product.variations![1])}</small>    
                                                        <small className="bg-peach whitespace-nowrap rounded-xl py-1 px-2" key={idx}>+{product.variations!.length - 2} More</small>
                                                    </>
                                                }
                                                {
                                                     ArrayExistsAndHasLengthLargerThanTwo(product.variations) && ( (product.variations![0] + product.variations![0]).length > 15 ) && <>
                                                        <small className="bg-peach whitespace-nowrap rounded-xl py-1 px-2" >{capitalizeAll(product.variations![0])}</small>
                                                        <small className="bg-peach whitespace-nowrap rounded-xl py-1 px-2" key={idx}>+{product.variations!.length - 1} More</small>
                                                    </>
                                                }
                                                </div>
                                                <div className="w-full md:hidden ">
                                                    { product.variations && product.variations.length > 0 &&
                                                        <small className="bg-peach rounded-xl py-1 px-2" >{product.variations.length} Variations</small>
                                                    }
                                                </div>
                                            </div>
                                            <div className="flex flex-col md:flex-row mt-1 gap-3 md:gap-0 relative justify-between">
                                                <span className="flex gap-1 items-baseline">
                                                    <small className="text-sm">GHS</small>
                                                    <h2 className="text-xl mb-0 font-bold">{styledCedis(product.price!) }</h2>
                                                </span>
                                                <span className={`bg-gray-200 flex ${productIndexInCart == null ? 'w-fit md:ml-0 p-0 md:p-1' : 'p-1' } gap-2 justify-between md:justify-normal items-center rounded-full`}>
                                                    <span style={{display: (productIndexInCart == null ? 'none': 'flex')}} className={`text-gray-400 rounded-full w-7 md:w-5 h-7 md:h-5 flex items-center justify-center duration-150 ${(productIndexInCart == null) ? '' : 'hover:bg-white'}`} onClick={(e)=>{e.stopPropagation(); (productIndexInCart == null) ? null : removeFromCart(product)} }><FontAwesomeIcon width={12} height={12} icon={faMinus} /></span>
                                                    <span style={{display: (productIndexInCart == null ? 'none': 'flex')}} className="text-sm text-gray-500 font-black items-center">{productIndexInCart != null ? cart.products[productIndexInCart].quantity : 0 }</span>
                                                    <span className={`rounded-full w-7 md:w-5 h-7 md:h-5 flex items-center justify-center duration-150 ${productIndexInCart == null ? 'bg-red md:bg-gray-200 gap-2 md:gap-0 w-[4.5rem] md:w-5 text-white md:text-gray-400 p-1' : ' bg-gray-200 text-gray-400'} hover:bg-white`} onClick={(e)=>{e.stopPropagation(); addToCart(product)}}><FontAwesomeIcon width={12} height={12} icon={faPlus} /><span className={`${ (productIndexInCart == null) ? 'block md:hidden' : 'hidden'}`} >Add</span></span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                        }
                    </section>
                </div>
                <div className="fixed bg-white z-[50] px-8 py-4 flex items-center justify-center md:hidden bottom-0 w-full">
                    <button className="flex items-center justify-center gap-2 w-full" onClick={()=>setShowCart(true)}> <FontAwesomeIcon className="mr-1" width={15} height={15} icon={faShoppingCart} /> My Cart ({cart.products?.length})</button>
                </div>
            </main>
            <Footer />
        </>
    )
}