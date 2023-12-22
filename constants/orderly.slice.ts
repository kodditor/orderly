import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { IShop } from '@/models/shop.model'
import { merge } from 'lodash'
import { IUserMetadataWithIDAndEmail } from '@/models/user.model'

interface IShopAndUser {
  shop :IShop
  user :IUserMetadataWithIDAndEmail
}

  const initialState: IShopAndUser = {
    shop: {
      createdAt: '',
      description: null,
      id: '',
      imageURL: null,
      location: null,
      name: '',
      optionalEmail: null,
      optionalPhone: null,
      shopNameTag: '',
      tags: [],
      updatedAt: '',
      userID: null
    },
    user: {
      id: '',
      email: '',
      firstName: '',
      isOrderly: true,
      lastName: '',
      location: {
          aptNum: '',
          city: '',
          country: '',
          region: '',
          streetAddress: ''
      },
      locationExists: true,
      phoneNumber: '',
      plan: { 
          isAnnual: true, 
          name: '' 
      },
      shopID: ''
    }
  }
  
  export function getOrderlyReducer(shop: IShop,user: IUserMetadataWithIDAndEmail){
    
    const initialState: IShopAndUser = {
      shop: shop,
      user: user
    }

    let slice = createSlice({
      name: 'shopAndUser',
      initialState,
      reducers: {
          //@ts-ignore
        setShop: (state, action: PayloadAction<IShop>) => {
          state.shop = action.payload
        },
        updateShop: (state, action: PayloadAction<IShop>) => {
          state.shop = merge(state, action.payload)
          // Probably call a supabase update func here
        },
        setUser: (state, action: PayloadAction<IUserMetadataWithIDAndEmail>) => {
          state.user = action.payload
        },
      },
    })
    return slice.reducer
  }


  // From the docs
  export const orderlySlice = createSlice({
    name: 'shopAndUser',
    initialState,
    reducers: {
        //@ts-ignore
      setShop: (state, action: PayloadAction<IShop>) => {
        state.shop = action.payload
      },
      updateShop: (state, action: PayloadAction<IShop>) => {
        state.shop = merge(state, action.payload)
        // Probably call a supabase update func here
      },
      setUser: (state, action: PayloadAction<IUserMetadataWithIDAndEmail>) => {
        state.user = action.payload
      },
    },
  })
  
  // Action creators are generated for each case reducer function
  export const { setShop, setUser ,updateShop } = orderlySlice.actions

  const orderlyReducer = orderlySlice.reducer

  export default orderlyReducer