import { configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from 'redux'
import sessionReducer from './slices/sessionSlice'

const persistConfig = {
  key: 'root',
  storage,
}

const rootReducer = combineReducers({
  session: sessionReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // 🚀 disables the non-serializable check
    }),
})

export const persistor = persistStore(store)
