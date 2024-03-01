import { faInfo } from "@fortawesome/free-solid-svg-icons/faInfo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { POPUP_ICON } from "@/models/popup.enum";


export function popupText(text:string, state?: POPUP_ICON){
    //console.log('Changed popup')
    const popupText = document.getElementById("popup-text")!
    const popupContainer = document.getElementById("popup-container")!
    popupText.innerHTML = text
    popupContainer.style.display = 'block'
    setTimeout( ()=>{ popupContainer.style.display = 'none'}, 4000)
    // solution to changing the icon might be through accessing the i class field and changing the classnames (since fa uses the fa-{item} syntax) 

}

export default function Popup (){

    return(
        <>
            <div className="fixed w-[80%] z-[99] ml-10 md:w-fit bottom-5 md:bottom-10 md:right-10 md:left-auto"  style={{display:'none'}} id="popup-container">
                <div className="flex gap-2 items-center border-2 bg-white border-darkRed px-3 py-2 rounded-full">
                    <div className="w-[20px] animate-pulse h-[20px] rounded-full bg-darkRed flex items-center justify-center">
                        <FontAwesomeIcon className="w-1 text-white" icon={faInfo} />
                    </div>
                    <p className="w-[calc(100%-28px)]" id="popup-text">This is a popup!</p>                    
                </div>
            </div>
        </>
    )

}