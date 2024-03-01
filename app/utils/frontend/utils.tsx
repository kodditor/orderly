import { capitalize } from "lodash";
import { Ref, RefObject } from "react";
import { ordersType } from "../db/supabase-client-queries";
import { Tables } from "@/types/supabase";
import { IOrderProducts } from "@/models/OrderProducts.model";

export function fadePages(parentRef :RefObject<HTMLDivElement>) {

    const parent = parentRef!.current!
    parent.style.animation = 'fadeInOut forwards .5s ease-in-out'
    setTimeout(()=>{
        parent.style.animation = ''
    }, 500)
}

export function getCSV(unseparatedString: string)
{
    const valuesArray:string[] = []
    unseparatedString.split(',').map((t) =>{valuesArray.push(removeSpaces(t))})
    return valuesArray;
}

function removeSpaces(string: string)
{
    if (string.startsWith(" "))
    {
        return removeSpaces(string.replace(" ", ""))
    }
    else{
        return string
    }
    
}

export function getBlobAndURLFromArrayBuffer(arrayBuffer :any, file:File|null=null)
{
        const blob = new Blob([new Uint8Array(arrayBuffer)], {type: file!.type });
        var urlCreator = window.URL || window.webkitURL;
        var imageUrl = urlCreator.createObjectURL(blob);

        return {blob, imageUrl };
}

export function getExtension(path: string) {
    var a = path.split(".");
    if( a.length === 1 || ( a[0] === "" && a.length === 2 ) ) {
        return "";
    }
    return a.pop();
}

export function pesewasToCedis(pesewas:number){
    return (pesewas/100)
}

export function styledCedis(pesewas: number):string {
    return pesewasToCedis(pesewas).toLocaleString('en', { maximumFractionDigits: 2, minimumFractionDigits: 2 })
}

export function cedisToPesewas(cedis:number){
    return Number((cedis * 100).toFixed(0))
}

export function capitalizeAll(s: string) :string{
    let sArray = s.split(' ')
    if (sArray.length == 1){
        return (s[0].toUpperCase() + s.slice(1))    
    } else {
        return sArray.map((s)=>{return capitalizeAll(s)}).join(' ')
    }
}

export function getOrderTotal(order: ordersType[0]) :number{
    let total = 0
    for(let i = 0; i < order.order_products.length; i++){
        total += order.order_products[i].price * order.order_products[i].quantity 
    }
    return total
}

export function sortByDateUpdated(a: Partial<Tables<'products'>> | Partial<Tables<'orders'>>, b: Partial<Tables<'products'>>| Partial<Tables<'orders'>>): -1 | 1 | 0 {
        
    if(!a.updated_at && !b.updated_at) return 0
    if(!a.updated_at) return 1
    if(!b.updated_at) return -1

    let firstDate = new Date(a.updated_at!)
    let nextDate = new Date(b.updated_at!)

    if( firstDate < nextDate) return 1
    if( firstDate > nextDate ) return -1
    if( firstDate == nextDate ) return 0
    
    return 0
}

export function getLocalShop(): string{
    if (typeof window == 'undefined') return ''
    let shopNameTag = localStorage.getItem('o-shopNT');
    if (shopNameTag == null) {
        setLocalCart([])
        return ''
    }
    return JSON.parse(shopNameTag)
}

// Todo: Check if shopNameTag is the same

export function getLocalCart(shopNameTag: string) : IOrderProducts[]{
    if (typeof window == 'undefined') return []
    let ls = localStorage.getItem('o-crt');
    if (ls == null || getLocalShop() != shopNameTag) {
        setLocalShop(shopNameTag)
        setLocalCart([])
        return []
    }
    return JSON.parse(ls) as IOrderProducts[]
}

function setLocalShop(shopNameTag: string): void {
    localStorage.setItem('o-shopNT',JSON.stringify(shopNameTag))
}

function setLocalCart(products: IOrderProducts[]): void {
    localStorage.setItem('o-crt',JSON.stringify(products))
}

export function addToLocalCart(product: IOrderProducts): void{
    let products = getLocalCart(getLocalShop()) 
    products.push(product)
    setLocalCart(products)
}

export function removeFromLocalCart(product: IOrderProducts): void{
    let existing = getLocalCart(getLocalShop());
    let newArr = existing.filter((prod) => {return prod.product_id != product.product_id} ) 
    localStorage.setItem('o-crt',JSON.stringify(newArr))
}

export function updateProductOnLocalCart(product: IOrderProducts): void{
    let existing = getLocalCart(getLocalShop());
    let existingProduct = existing.find((prod) => {return (prod.product_id === product.product_id)})
    if(existingProduct){
        let newArr = existing.filter((prod) => {return prod.product_id != product.product_id} )
        let updatedProduct = {
            ...existingProduct,
            ...product
        }
        newArr.push(updatedProduct)
        setLocalCart(newArr)
    }
}

export function emptyCart(): void{
    setLocalCart([])
}


export function copyToClipboard(s: string): boolean {
    if (!navigator.clipboard){
        return false
    }

    try {
        navigator.clipboard.writeText(s)
        return true
    }
    catch(e){
        console.warn('Copy to clipboard failed')
        return false
    }
}