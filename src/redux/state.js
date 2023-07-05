import { configureStore } from "@reduxjs/toolkit";
import { busSlice, accountSlide } from "./reducer";

export const store = configureStore({
    reducer: {
        buses: busSlice.reducer,
        accounts: accountSlide.reducer
    }
})