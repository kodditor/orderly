export interface IShopperDetails {
    shopperFirstName: string,
    shopperLastName: string,
    location: ILocation,
    phone: string,
    shopper_user_id?: string,
    email:string
}

export interface ILocation {
    id?: string,
    city: string,
    buildingNum: string,
    streetAddress: string,
    region: string,
    country: string
}