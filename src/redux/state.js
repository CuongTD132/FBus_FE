import { configureStore } from "@reduxjs/toolkit";
import { busSlice } from "./reducer";

export const store = configureStore({
    reducer: {
        buses: busSlice.reducer
    }
})