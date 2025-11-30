import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";

import sessionReducer from "./slices/sessionSlice";
import jdReducer from "./slices/jdSlice";  // 🔥 JD slice imported

// 🔥 Persist config
const persistConfig = {
  key: "root",
  storage,
};

// 🔥 Add BOTH reducers here
const rootReducer = combineReducers({
  session: sessionReducer,
  jd: jdReducer,   // 🔥 IMPORTANT — you forgot this!
});

// 🔥 Wrap persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 🔥 Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // to avoid non-serializable errors
    }),
});

// 🔥 Persistor
export const persistor = persistStore(store);
