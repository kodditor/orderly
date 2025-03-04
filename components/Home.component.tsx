"use client"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBoltLightning, faHandsClapping, faShieldAlt } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import Image from "next/image";
import { usePostHog } from "posthog-js/react";
import gsap from 'gsap'
import {useGSAP} from '@gsap/react'
import { useEffect, useRef } from "react";

export default function ClientHome(){

	const parentRef = useRef<HTMLDivElement>(null)

    const postHog = usePostHog()

	/*
	
	gsap.registerPlugin(useGSAP)

	useGSAP(() => { 

		gsap.fromTo('hero-image', {
			scale: 1.3,
			scrollTrigger: {
				trigger: 'hero-image',
				start: 'top center',
				end: 'bottom center',
				scrub: true,
			}
		})

	}, {scope: parentRef})

	*/

    return (
        <>
            <main className="w-full h-[100%-4rem]" ref={parentRef}>
				<section className="flex bg-peach flex-col gap-4 justify-center pt-6 md:pt-16 w-[100%] px-[5%] md:px-[10%] 2xl:px-[20%] items-center">
					<h1 className="text-3xl md:text-6xl text-center font-black w-[80%] md:w-[60%] text-darkRed">Discover the easiest way to sell online</h1>
					<h3 className="text-xl text-center w-[80%] md:w-[55%] text-darkRed mb-2">Orderly is the digital storefront solution that enables businesses to list their products and receive orders from online customers. Start selling or buying today!</h3>
					<span className="flex items-center flex-row gap-2 md:gap-3 mb-4">
						<Link className="" href="/auth/signup?to=/onboarding">
							<button className="" onClick={()=>{postHog.capture('get_orderly_clicked_from_homepage')}}>Get Orderly</button>
						</Link>
						<a href="" className="">
							<button className="btn-secondary" >Learn More</button>
						</a>
					</span>
					<div className="hero-image relative w-[90%] md:w-full h-[27rem] md:h-[19rem]">
						<Image className="hidden md:block" src={'/img/desktop-dashboard.png'} alt="The Orderly Dashboard page" fill  />
						<Image className="md:hidden" src={'/img/mobile-dashboard.png'} alt="The Orderly Dashboard page" fill  />
					</div>
				</section>
				<section className="flex flex-col-reverse md:flex-row gap-4 md:gap-16 py-16 w-[100%] px-[5%] md:px-[10%] 2xl:px-[20%] m-auto justify-center items-center">
					<div className="w-full md:w-1/2 flex gap-8 flex-col">
						<div>
							<div className="w-full flex justify-center md:justify-start">
								<small className="text-sm text-center md:text-left">CONVENIENCE</small>
							</div>
							<h1 className="text-red w-[85%] m-auto md:w-full leading-snug text-2xl md:text-4xl mt-4 mb-4 font-bold md:font-extrabold text-center md:text-left">Experience the Convenience of Setting Up Your Digital Storefront</h1>
							<h4 className=" text-black text-xl w-[85%] md:w-full m-auto md:text-lg text-center md:text-left">Orderly provides a seamless solution for businesses to list their products and receive orders from online customers. With our user-friendly platform, you can easily set up your digital storefront and start selling in no time.</h4>
						</div>
						<div className="flex flex-col md:flex-row gap-8">
							<div>
								<span className="w-10 h-10 m-auto md:m-0 bg-peach rounded-full flex items-center justify-center">
									<FontAwesomeIcon className="text-red" style={{width: '15px', height: '15px'}} icon={faHandsClapping} />
								</span>
								<h3 className="text-darkRed text-xl font-bold mb-2 mt-2 text-center md:text-left" >Easy Setup</h3>
								<p className="text-black w-[85%] md:w-full m-auto text-xl md:text-lg text-center md:text-left">Our platform allows you to quickly and effortlessly list your products for online sale.</p>
							</div>
							<div>
								<span className="w-10 m-auto md:m-0 h-10 bg-peach rounded-full flex items-center justify-center">
									<FontAwesomeIcon className="text-red" style={{width: '15px', height: '15px'}} icon={faBoltLightning} />
								</span>
								
								<h3 className="text-darkRed text-xl font-bold text-center mb-2 mt-2 md:text-left" >Efficient Orders</h3>
								<p className="text-black w-[85%] md:w-full m-auto text-xl md:text-lg text-center md:text-left">Receive and manage orders from your customers with ease and efficiency.</p>
							</div>
						</div>
					</div>
					<div className="w-full hidden md:block md:max-w-none md:w-1/2">
						<div className="relative w-full h-[26rem] md:h-[22rem] md:w-[38rem] m-auto">
							<Image className="hidden md:block" fill alt="" src={'/img/desktop-shop.png'}/>
						</div>
					</div>
				</section>

				<section className="flex flex-col bg-peach md:flex-row gap-4 md:gap-16 py-16 w-[100%] px-[5%] md:px-[10%] 2xl:px-[20%] m-auto justify-center items-center">
					<Link href={'/s/showdownshoes'} className="w-full rounded-lg overflow-hidden md:max-w-none md:w-1/2">
						<div className="relative w-full md:w-[300px] h-[35.5rem] m-auto md:h-[520px]">
							<Image className="hidden md:block" alt="" fill src={'/img/mobile-products.png'}/>
							<Image className="block md:hidden" fill alt="" src={'/img/mobile-shop.png'}/>
						</div>
					</Link>
					<div className="w-full md:w-1/2 flex gap-8 flex-col">
						<div className="w-full">
							<div className="w-full flex justify-center md:justify-start">
								<small className="text-sm text-center md:text-left">SIMPLIFIED</small>
							</div>
							<h1 className="text-red leading-snug w-[85%] md:w-full m-auto text-2xl md:text-4xl mt-4 mb-4 font-bold text-center md:text-left">List and sell your products online</h1>
							<h4 className=" text-black text-xl w-[85%] md:w-full m-auto md:text-lg text-center md:text-left">Orderly provides an easy-to-use platform for businesses to list their products and receive orders from online customers. With our streamlined process, you can start selling your products online in no time.</h4>
						</div>
						<div className="flex flex-col md:flex-row gap-8">
							<div>
								<span className="w-10 h-10 m-auto md:m-0 bg-white rounded-full flex items-center justify-center">
									<FontAwesomeIcon className="text-red" style={{width: '15px', height: '15px'}} icon={faHandsClapping} />
								</span>
								<h3 className="text-darkRed w-[85%] md:w-full m-auto text-xl font-bold mb-2 mt-2 text-center md:text-left" >Easy Setup</h3>
								<p className="text-black w-[85%] md:w-full m-auto text-xl md:text-lg text-center md:text-left">Create your product listings and showcase them to a wide online audience.</p>
							</div>
							<div>
								<span className="w-10 m-auto md:m-0 h-10 bg-white rounded-full flex items-center justify-center">
									<FontAwesomeIcon className="text-red" style={{width: '15px', height: '15px'}} icon={faShieldAlt} />
								</span>
								
								<h3 className="text-darkRed w-[85%] md:w-full m-auto text-xl font-bold text-center mb-2 mt-2 md:text-left" >Secure Payments</h3>
								<p className="text-black text-xl w-[85%] md:w-full m-auto md:text-lg text-center md:text-left">Accept payments from customers securely through our integrated payment gateway.</p>
							</div>
						</div>
					</div>
					
				</section>

				<section className="flex flex-col-reverse md:flex-row gap-4 md:gap-16 py-16 w-[100%] px-[5%] md:px-[10%] 2xl:px-[20%] m-auto justify-center items-center">
					<div className="w-full md:w-1/2 flex gap-8 flex-col">
						<div className="w-full">
							<div className="w-full flex justify-center md:justify-start">
								<small className="text-sm text-center md:text-left">COMING SOON</small>
							</div>
							<h1 className="text-darkRed leading-snug md:leading-normal w-[85%] md:w-full m-auto text-2xl md:text-4xl mt-4 mb-4 font-bold text-center md:text-left">Convenient and Safe Payment Options</h1>
							<h4 className=" text-black text-xl w-[85%] md:w-full m-auto md:text-lg text-center md:text-left">We offer a variety of secure payment options to ensure a smooth and worry-free transaction process for our customers. From credit card payments to mobile money transfers, you can choose the option that works best for you.</h4>
						</div>
						<div className="flex flex-row justify-center md:justify-start gap-4">
							<Link className="" href="/auth/signup?to=/onboarding">
								<button onClick={()=>{postHog.capture('get_orderly_clicked_from_homepage')}}>Get Orderly</button>
							</Link>
							<button className="btn-secondary group flex gap-2 items-center">
								Learn More
								<FontAwesomeIcon className="group-hover:ml-1 ml-0 duration-150" style={{width: '15px', height: '15px', display: 'inline'}} icon={faArrowRight} />
							</button>
						</div>
					</div>
					<div className="w-full max-w-[300px] rounded-lg overflow-hidden md:max-w-none md:w-1/2">
						<div className="relative h-full w-full">
							<img alt="" src={'/img/payment.png'}/>
						</div>
					</div>
				</section>

				<section className="bg-peach py-16 w-[100%] px-[5%] md:px-[10%] 2xl:px-[20%] m-auto">
					<div className="w-full max-w-[300px] m-auto md:max-w-none md:w-1/2">
						<div className="w-full flex justify-center">
							<small className="text-sm text-center">SIMPLIFIED</small>
						</div>
					</div>
					<h1 className="text-darkRed leading-snug w-[85%] m-auto text-2xl md:text-4xl mt-4 mb-8 md:mb-16 font-bold text-center">Effortless setup for expanding your market reach</h1>
					<div className="w-full flex flex-col md:flex-row gap-12 md:gap-8 mb-4 md:mb-8">				
						<div className="w-full md:w-1/3">
							<div className="w-full aspect-[4/3] object-fill flex items-center justify-center rounded-lg overflow-hidden md:justify-start">
								<img className="w-full" src="/img/orders.png" />
							</div>
							<h1 className="text-red leading-snug text-xl w-[85%] m-auto md:text-2xl mt-2 mb-2 md:mt-4 md:mb-4 font-bold text-center">Streamlined order management and fulfillment</h1>
							<h4 className=" text-black text-xl w-[85%] m-auto md:text-lg text-center">With Orderly Ghana, you can easily manage and fulfill orders, ensuring a smooth and efficient process for your business.</h4>
						</div>

						<div className="w-full md:w-1/3">
							<div className="w-full aspect-[4/3] object-fill flex items-center justify-center rounded-lg overflow-hidden md:justify-start">
								<img className="w-full" src="/img/payments-2.png" />
							</div>
							<h1 className="text-red leading-snug text-xl w-[85%] m-auto md:text-2xl mt-2 mb-2 md:mt-4 md:mb-4 font-bold text-center">Secure and reliable online payment processing</h1>
							<h4 className=" text-black text-xl w-[85%] m-auto md:text-lg text-center">Rest assured that your online payments are safe and secure with our trusted payment processing system.</h4>
						</div>
						<div className="w-full md:w-1/3">
							<div className="w-full aspect-[4/3] object-fill flex items-center justify-center rounded-lg overflow-hidden md:justify-start">
								<img className="w-full" src="/img/support.png" />
							</div>
							<h1 className="text-red leading-snug text-xl w-[85%] m-auto md:text-2xl mt-2 mb-2 md:mt-4 md:mb-4 font-bold text-center">Dedicated support for your business growth</h1>
							<h4 className=" text-black text-xl w-[85%] m-auto md:text-lg text-center">Our team is committed to providing dedicated support to help your business thrive. We are here to assist you every step of the way.</h4>
						</div>
					</div>
					<div className="w-full flex gap-4 justify-center">
						<div className="flex gap-4 items-center">
							<Link className="" href="/auth/signup?to=/onboarding">
								<button onClick={()=>{postHog.capture('get_orderly_clicked_from_homepage')}}>Get Orderly</button>
							</Link>
							<button className="btn-secondary group flex gap-2 items-center">
								Learn More
								<FontAwesomeIcon className="group-hover:ml-1 ml-0 duration-150" style={{width: '15px', height: '15px', display: 'inline'}} icon={faArrowRight} />
							</button>
						</div>
					</div>				
				</section>
				<section className="bg-red text-white py-16 w-[100%] px-[5%] md:px-[10%] 2xl:px-[20%] m-auto">
					<div className="w-3/4 md:w-1/2 m-auto flex flex-col">
						<h1 className="leading-snug md:leading-normal mb-0 text-4xl font-bold text-center">Create Your Digital Storefront</h1>
						<h4 className="text-center text-xl mt-2">Join Orderly and start selling your products online today.</h4>
						<div className="flex gap-4 justify-center mt-4">
                            <Link className="" href="/auth/signup?to=/onboarding">
							    <button className="!text-white hover:bg-white hover:!text-red !shadow-none !border-white btn-secondary" onClick={()=>{postHog.capture('get_orderly_clicked_from_homepage')}}>Get Orderly</button>
                            </Link>
						</div>
					</div>
				</section>
			</main>
        </>
    )
}