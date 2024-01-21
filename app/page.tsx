import Image from "next/image";
import Header from "../components/Header.component";

export default function Home() {
	return (
		<>
			<Header />
			<main className="w-screen h-[100%-4rem] pt-16">
				<section className="flex bg-peach flex-col gap-4 justify-center items-center">
					<h1 className="text-3xl md:text-5xl text-center font-black w-[80%] md:w-[55%] text-darkRed">Discover the easiest way to sell online</h1>
					<h3 className="text-xl md:text-2xl text-center w-[80%] md:w-[55%] text-darkRed">Orderly is the digital storefront solution that enables businesses to list their products and receive orders from online customers. Start selling or buying today!</h3>
					<span className="flex flex-col md:flex-row gap-2 md:gap-3">
						<a href="https://getwaitlist.com/waitlist/12417">
							<button>GET ORDERLY</button>
						</a>
						<a href="javascript:void(0)">
							<button className="btn-secondary">LEARN MORE</button>
						</a>
					</span>
					<small className="text-grey-200 font-italics">COMING SOON</small>
				</section>
				<section className="flex flex-col md:flex-row gap-4 py-8 md:py-16 w-[90%] md:w-[80%] m-auto justify-center items-center">
					<div className="w-1/2 flex gap-8 flex-col">
						<div>
							<h1 className="text-red text-2xl mb-4 font-extrabold text-center md:text-left">Experience the Convenience of Setting Up Your Digital Storefront</h1>
							<h4 className="text-black text-lg text-center md:text-left">Orderly Ghana provides a seamless solution for businesses to list their products and receive orders from online customers. With our user-friendly platform, you can easily set up your digital storefront and start selling in no time.</h4>
						</div>
						<div className="flex flex-col md:flex-row gap-8">
							<div>
								<h3 className="text-red text-xl font-bold text-center mb-2 md:text-left" >Easy Setup</h3>
								<p className="text-black text-lg text-center md:text-left">Our platform allows you to quickly and effortlessly list your products for online sale.</p>
							</div>
							<div>
								<h3 className="text-red text-xl font-bold text-center mb-2 md:text-left" >Efficient Orders</h3>
								<p className="text-black text-lg text-center md:text-left">Receive and manage orders from your customers with ease and efficiency.</p>
							</div>
						</div>
					</div>
					<div>
						<div className="relative w-1/2">
							<Image alt="" fill src={'/next.svg'}/>
						</div>
					</div>
				</section>
			</main>
		</>
	)
}
