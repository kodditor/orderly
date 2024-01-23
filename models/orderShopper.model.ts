export interface IShopperDetails {
    name: string,
    location: {
        city: string,
        aptNum: string,
        region: string,
        country: string,
        streetAddress: string 
      },
    phone: string,
}