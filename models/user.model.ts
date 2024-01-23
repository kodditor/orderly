import { User } from "@supabase/supabase-js";

export interface IUserMetadataWithIDAndEmail extends IUserMetadata {
    id: string,
    email: string,
}

export interface IUserMetadata {
    firstName: string,
    isOrderly: boolean,
    lastName: string,
    location?: {
        aptNum: string,
        city: string,
        country: string,
        region: string,
        streetAddress: string
    },
    locationExists: boolean,
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