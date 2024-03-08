import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { IShop } from '@/models/shop.model'
import { merge } from 'lodash'
import { IUserMetadataWithIDAndEmail, signedInUser } from '@/models/user.model'
import { Tables } from '@/types/supabase'
import { ordersType } from '@/app/utils/db/supabase-client-queries'

interface IShopAndUser {
  shop : IShop
  user :signedInUser
  products: Tables<'products'>[]
  orders: ordersType
}

  const initialState: IShopAndUser = {
    shop: {
      createdAt: '',
      description: '',
      id: '',
      imageURL: '',
      location: {
        buildingNum: '',
        city: '',
        country: '',
        created_at: null,
        id: '',
        region: '',
        streetAddress: '',
        updated_at: ''
      },
      name: '',
      optionalEmail: null,
      optionalPhone: null,
      shopNameTag: '',
      tags: [],
      updatedAt: '',
      deleted_at: '',
      user_id: ''
    },
    user: {
      id: '',
      email: '',
      firstName: '',
      lastName: '',
      location: {
        id: '',
        buildingNum: '',
        city: '',
        country: '',
        region: '',
        streetAddress: ''
      },
      phoneNumber: '',
      shop_id: ''
    },
    products: [],
    orders: []
  }
  
  export function getOrderlyReducer(shop: IShop,user: signedInUser){

    const initialState: IShopAndUser = {
      shop: shop,
      user: user,
      products: [],
      orders: []
    }

    let slice = createSlice({
      name: 'shopAndUser',
      initialState,
      reducers: {
          //@ts-ignore
        setShop: (state, action: PayloadAction<IShop>) => {
          state.shop = action.payload
        },
        updateShop: (state, action: PayloadAction<Partial<IShop>>) => {
          state.shop = {
            ...state.shop,
            ...action
          }
          // Probably call a supabase update func here
        },
        setUser: (state, action: PayloadAction<signedInUser>) => {
          state.user = action.payload
        },
        setProducts: (state, action: PayloadAction<Tables<'products'>[]>) => {
          state.products = action.payload
        },
        addProduct: (state, action: PayloadAction<Tables<'products'>>) => {
          state.products.unshift(action.payload)
        },
        removeProduct: (state, action: PayloadAction<Tables<'products'>>) => {
          state.products = state.products.filter((product) =>  {return (product.id != action.payload.id) } )
        },
        setOrders: (state, action: PayloadAction<ordersType>) => {
          state.orders = action.payload
        },
        addOrder: (state, action: PayloadAction<ordersType>) => {
          state.orders.unshift(action.payload[0])
        },
        removeOrder: (state, action: PayloadAction<Tables<'orders'>>) => {
          state.orders = state.orders?.filter((order) =>  {return (order.id != action.payload.id) } )
        },
      },
    })
    return slice.reducer
  }


  // From the docs !! Deprecated
  export const orderlySlice = createSlice({
    name: 'shopAndUser',
    initialState,
    reducers: {
        //@ts-ignore
      setShop: (state, action: PayloadAction<IShop>) => {
        state.shop = action.payload
      },
      updateShop: (state, action: PayloadAction<Partial<IShop>>) => {
        state.shop = {
          ...state.shop,
          ...action
        }
      },
      setUser: (state, action: PayloadAction<signedInUser>) => {
        state.user = action.payload
      },
      setProducts: (state, action: PayloadAction<Tables<'products'>[]>) => {
        state.products = action.payload
      },
      addProduct: (state, action: PayloadAction<Tables<'products'>>) => {
        state.products.unshift(action.payload)
      },
      removeProduct: (state, action: PayloadAction<Tables<'products'>>) => {
        state.products = state.products?.filter((product) =>  {return (product.id != action.payload.id) } )
      },
      setOrders: (state, action: PayloadAction<ordersType>) => {
        state.orders = action.payload
      },
      addOrder: (state, action: PayloadAction<ordersType>) => {
        state.orders.unshift(action.payload[0])
      },
      removeOrder: (state, action: PayloadAction<Tables<'orders'>>) => {
        state.orders = state.orders?.filter((order) =>  {return (order.id != action.payload.id) } )
      },
    },
  })
  
  // Action creators are generated for each case reducer function
  export const { 
    setShop, 
    setUser,
    updateShop, 
    setProducts, 
    addProduct,
    removeProduct,
    setOrders,
    addOrder,
    removeOrder } = orderlySlice.actions

  const orderlyReducer = orderlySlice.reducer

  export default orderlyReducer