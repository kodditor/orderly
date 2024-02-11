export interface IShopperDetails {
    shopperFirstName: string,
    shopperLastName: string,
    location: ILocation,
    phone: string,
    shopper_user_id?: string,
    email:string
}

export interface ILocation {
    city: string,
    buildingNum: string,
    streetAddress: string,
    region: string,
    country: string
}