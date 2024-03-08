import { POPUP_STATE } from "@/models/popup.enum";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/ReactToastify.css' ;

export function popupText(text:string, state?: POPUP_STATE){
    if(state == undefined){
        toast(text)
    }

    switch (state) {
        case POPUP_STATE.SUCCESS:
            toast.success(text)
            break;
        case POPUP_STATE.FAILED:
            toast.error(text)
            break;

        case POPUP_STATE.INFO:
            toast.info(text)
            break;

        case POPUP_STATE.WARNING:
            toast.warning(text)
            break;
        default:
            break;
    }

}

export default function Popup (){

    return(
        <>
            <ToastContainer
                position="bottom-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </>
    )

}