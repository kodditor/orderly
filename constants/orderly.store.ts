import { configureStore } from '@reduxjs/toolkit'
import orderlyReducer from './orderly.slice'

export const orderlyStore = configureStore({
  reducer: {
    shopAndUser: orderlyReducer
  },
})


export type RootState = ReturnType<typeof orderlyStore.getState>
export type AppDispatch = typeof orderlyStore.dispatch