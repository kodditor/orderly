"use client"
import { clientSupabase } from "@/app/supabase/supabase-client";
import { styledCedis } from "@/app/utils/frontend/utils";
import Footer from "@/components/Footer.component";
import Header from "@/components/Header.component";
import { popupText } from "@/components/Popup.component";
import { IFavourite } from "@/models/favourites.models";
import { signedInUser } from "@/models/user.model";
import { faCross, faHeart, faMinus, faTrashCan, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";


export default function FavsComponent({user}:{user: signedInUser}){

    const [ isLoading, setIsLoading  ] = useState<boolean>(true)
    const [favourites, setFavourites ] = useState<IFavourite[] | null>(null) 
    const [ hasChangedFavourites, changeFavourites ] = useState<boolean>(false)

    useEffect(() =>{
        clientSupabase
        .from('favourites')
        .select('*, product(*, shop_id(shopNameTag))')
        .returns<IFavourite[]>()
        .then(({data, error}) => {
            if(error != null){
                popupText(`SB${error.code}: An error occurred`)
            }
            else {
                setFavourites(data)
            }
            setIsLoading(false)
        })
    }, [hasChangedFavourites])

    function removeFromFavourites(product_id: string){
        if(favourites == null || favourites.length == 0) return

        const deletedFavIndex = favourites.findIndex((fav) => fav.product.id == product_id)

        clientSupabase
        .from('favourites')
        .delete()
        .eq('product', product_id)
        .then(({error}) => {
            if(error != null){
                console.log(error)
                popupText(`SB${error.code}:An error occurred while trying to remove the product from your favourites`)
                return
            }
            setFavourites((prev) => {
                const before = prev?.slice(0, deletedFavIndex)
                const after = prev?.slice(deletedFavIndex + 1)
                return ([
                    ...(before ?? []),
                    ...(after ?? [])
                ])
            })
            changeFavourites(prev => !prev)
            popupText(`Removed from your favourites.`)
        })
    }

    return (
        <>
            <Header signedInUser={user} />
            <main className="w-screen min-h-[calc(100vh-50px-173px)] md:min-h-[calc(100vh-70px-66px)] bg-gray-50 grid place-items-center">
                <div className="w-full bg-white p-4 md:p-8 md:shadow-md md:rounded-xl md:max-w-[800px] md:overflow-auto h-full md:max-h-[550px]">
                    <div className="h-fit">
                        <span className="mt-2 mb-2 md:mb-4 flex items-center gap-2">
                            <FontAwesomeIcon width={25} height={25} className="text-red" icon={faHeart} />
                            <h1 className="font-bold text-xl  md:text-2xl">My Favourites</h1>
                        </span>
                        <div className="bg-gray-50 rounded-lg w-full min-h-[400px]  mb-4 overflow-auto flex flex-col gap-3 p-2">
                            {
                                isLoading && 
                                <>
                                    <p className="text-gray-400 text-center animate-pulse font-medium m-auto">Loading your favs...</p>
                                </>
                            }
                            {
                                !isLoading && (favourites?.length == 0 || favourites == null) &&
                                <>
                                    <p className="text-gray-400 text-center animate-pulse font-medium m-auto">You have no favourites.</p>
                                </>
                            }
                            {
                                !isLoading && favourites != null && favourites.map((fav, idx) =>{
                                    return (
                                        <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/s/${fav.product.shop_id.shopNameTag}/?product=${fav.product.id}`} className="group rounded-lg duration-150 relative bg-white border-[1px] border-gray-200 h-full overflow-hidden flex items-center" key={idx}>
                                            <span className="h-[80px] md:h-[90px] w-[80px] md:w-[90px] aspect-square border-r-2 border-gray-200 overflow-hidden flex justify-center items-center">
                                                <img src={fav.product.imageURL!} />
                                            </span>
                                            <div className="w-[calc(100%-100px)] flex flex-col md:flex-row md:justify-between p-2 md:p-4 gap-1 md:gap-2">
                                                <h1 className="text-lg leading-5 md:leading-normal mb-0 md:mb-0">{fav.product.name}</h1>
                                                <span className="flex flex-col md:flex-row md:justify-end md:gap-4">
                                                    <h3 className="font-medium text-md md:text-lg">GHS{styledCedis(fav.product.price!)}</h3>
                                                    <div className={`text-gray-700 hover:text-red hidden md:flex cursor-pointer duration-150 w-5 md:w-8 h-5 md:h-8 rounded-lg  overflow-hidden items-center justify-center`} onClick={(e)=>{ e.preventDefault(); removeFromFavourites(fav.product.id)}}>
                                                        <FontAwesomeIcon width={12} height={12} icon={faTrashCan}/>
                                                    </div>
                                                </span>
                                            </div>
                                            <div className="md:hidden absolute right-2 top-2 bg-gray-200 text-gray-400 rounded-full w-5 h-5 hover:bg-red hover:text-white grid place-items-center duration-150" onClick={(e)=>{e.preventDefault(); removeFromFavourites(fav.product.id)}}>
                                                <FontAwesomeIcon width={6} height={6} icon={faX}/>
                                            </div>
                                        </Link>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )

}