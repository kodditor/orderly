import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { IShop } from '@/models/shop.model'
import { merge } from 'lodash'
import { IUserMetadataWithIDAndEmail } from '@/models/user.model'
import { Tables } from '@/types/supabase'

interface IShopAndUser {
  shop :IShop
  user :IUserMetadataWithIDAndEmail
  products: Tables<'products'>[]
  orders: Tables<'orders'>[]
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
      user_id: null
    },
    user: {
      id: '',
      email: '',
      firstName: '',
      isOrderly: true,
      lastName: '',
      location: {
        buildingNum: '',
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
      shop_id: ''
    },
    products: [],
    orders: []
  }
  
  export function getOrderlyReducer(shop: IShop,user: IUserMetadataWithIDAndEmail){

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
        updateShop: (state, action: PayloadAction<IShop>) => {
          state.shop = merge(state, action.payload)
          // Probably call a supabase update func here
        },
        setUser: (state, action: PayloadAction<IUserMetadataWithIDAndEmail>) => {
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
        setOrders: (state, action: PayloadAction<Tables<'orders'>[]>) => {
          state.orders = action.payload
        },
        addOrder: (state, action: PayloadAction<Tables<'orders'>>) => {
          state.orders.unshift(action.payload)
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
      updateShop: (state, action: PayloadAction<IShop>) => {
        state.shop = merge(state, action.payload)
        // Probably call a supabase update func here
      },
      setUser: (state, action: PayloadAction<IUserMetadataWithIDAndEmail>) => {
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
      setOrders: (state, action: PayloadAction<Tables<'orders'>[]>) => {
        state.orders = action.payload
      },
      addOrder: (state, action: PayloadAction<Tables<'orders'>>) => {
        state.orders.unshift(action.payload)
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