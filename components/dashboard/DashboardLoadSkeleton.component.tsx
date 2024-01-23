"use client"
import {useEffect} from 'react'


export default function DashboardLoadSkeleton() {

    function tooLong(){
        document.getElementById('too-long')!.style.display = 'block'
    }

    useEffect(()=>{
        setTimeout(tooLong,15000)
    }, [])


    return(
        <>
            <div className="w-screen h-screen flex gap-8 flex-col items-center justify-center">
                <img className="animate-pulse w-72 md:w-96" src="/img/logo.png"/>
                <p style={{display: 'none'}} id="too-long" className="text-center text-red">
                    Oh dear!<br />We seem to be experiencing a network error.<br />Please check your internet connection.
                </p>
            </div>
        </>
    )
}