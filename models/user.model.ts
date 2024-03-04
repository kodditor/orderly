import { User } from "@supabase/supabase-js";

export interface IUserMetadataWithIDAndEmail extends IUserMetadata {
    id: string,
    email: string,
}

export interface IUserMetadata {
    firstName: string,
    isOrderly: boolean,
    lastName: string,
    location: {
        buildingNum: string,
        city: string,
        country: string,
        region: string,
        streetAddress: string
    },
    phoneNumber: string,
    plan?: { 
        isAnnual: boolean,
        name: string 
    },
    shop_id: string
}

export interface IUser extends User {
    user_metadata: IUserMetadata
}

//It's the same thing lol.
export interface signedInUser {
    id: string,
    email: string,
    firstName: string,
    lastName: string | null,
    location: {
        id: string,
        buildingNum: string,
        city: string,
        country: string,
        region: string,
        streetAddress: string
    },
    phoneNumber: string | null,
    isOrderly: boolean,
    shop_id?: string
}