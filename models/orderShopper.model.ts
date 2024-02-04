export interface IShopperDetails {
    shopperFirstName: string,
    shopperLastName: string,
    location: {
        city: string,
        buildingNum: string,
        streetAddress: string,
        region: string,
        country: string
      },
    phone: string,
    shopper_user_id?: string
}