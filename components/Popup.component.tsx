import { faInfo } from "@fortawesome/free-solid-svg-icons/faInfo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { POPUP_ICON } from "@/models/popup.enum";


export function popupText(text:string, state?: POPUP_ICON){

    const popupText = document.getElementById("popup-text")!
    popupText.style.display = 'block'
    popupText.innerHTML = text
    setTimeout( ()=>{ popupText.style.display = 'none'}, 3000)
    // solution to changing the icon might be through accessing the i class field and changing the classnames (since fa uses the fa-{item} syntax) 

}

export default function Popup (){

    return(
        <>
            <div className="fixed w-[80%] ml-10 md:w-fit bottom-5 md:left-5 md:right-auto">
                <div className="flex gap-2 items-center border-2 bg-white border-darkRed px-3 py-2 rounded-full">
                    <div className="w-[20px] h-[20px] rounded-full bg-darkRed flex items-center justify-center">
                        <FontAwesomeIcon className="w-1 text-white" icon={faInfo} />
                    </div>
                    <p className="w-[calc(100%-28px)]" id="popup-text">This is a popup!</p>                    
                </div>
            </div>
        </>
    )

}