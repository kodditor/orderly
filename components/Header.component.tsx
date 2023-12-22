

export default function Header(){
    return (
        <nav className="sticky top-0 z-40 flex items-center justify-between px-8 md:px-16 h-16 border-b-2 border-b-grey-200">
            <h3 className="text-2xl font-bold">Orderly</h3>
            <span>
                <button>Get Orderly</button>
            </span>
        </nav>
    )
}