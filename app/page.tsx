import Header from "../components/Header.component";

export default function Home() {
  return (
    <>
      <Header />
      <main className="w-screen h-[100%-4rem] pt-16 flex flex-col gap-8 justify-center items-center">
        <h1 className="text-3xl md:text-5xl text-center font-black w-[80%] md:w-[55%] text-darkRed">Join hundreds of Ghanaian businesses elevating their online ordering experience with Orderly.</h1>
        <a href="https://getwaitlist.com/waitlist/12417"><button>Get Orderly</button></a>
        <small className="text-grey-200 font-italics">COMING SOON</small>
      </main>
    </>
  )
}
