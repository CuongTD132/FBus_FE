import { configureStore } from "@reduxjs/toolkit";
import { busSlice, accountSlide, driverSlide, stationSlide, routeSlide, coordinationSlide } from "./reducer";

export const store = configureStore({
    reducer: {
        buses: busSlice.reducer,
        accounts: accountSlide.reducer,
        drivers: driverSlide.reducer,
        stations: stationSlide.reducer,
        routes: routeSlide.reducer,
        // coordinations: coordinationSlide.reducer,
    }
})