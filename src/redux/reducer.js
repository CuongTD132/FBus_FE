import { createSlice } from "@reduxjs/toolkit";

export const  busSlice = createSlice({
    name: 'BUSES',
    initialState: {
        value: [],
        currentSearchBus: ""
    },
    reducers: {
        updateBus: (state, action) => {
            state.value = action.payload;
        },
        setCurrentSearchBus: (state, action) => {
            state.currentSearchBus = action.payload;
        },
    }
});

export const  accountSlide = createSlice({
    name: 'ACCOUNTS',
    initialState: {
        value: [],
        currentSearchAccount: ""
    },
    reducers: {
        updateAccount: (state, action) => {
            state.value = action.payload;
        },
        setCurrentSearchAccount: (state, action) => {
            state.currentSearchAccount = action.payload;
        },
    }
});

export const  driverSlide = createSlice({
    name: 'DRIVERS',
    initialState: {
        value: [],
        currentSearchDriver: ""
    },
    reducers: {
        updateDriver: (state, action) => {
            state.value = action.payload;
        },
        setCurrentSearchDriver: (state, action) => {
            state.currentSearchDriver = action.payload;
        },
    }
});

export const  stationSlide = createSlice({
    name: 'STATIONS',
    initialState: {
        value: [],
        currentSearchStation: ""
    },
    reducers: {
        updateStation: (state, action) => {
            state.value = action.payload;
        },
        setCurrentSearchStation: (state, action) => {
            state.currentSearchStation = action.payload;
        },
    }
});

export const  routeSlide = createSlice({
    name: 'ROUTES',
    initialState: {
        value: [],
        currentSearchRoute: ""
    },
    reducers: {
        updateRoute: (state, action) => {
            state.value = action.payload;
        },
        setCurrentSearchRoute: (state, action) => {
            state.currentSearchRoute = action.payload;
        },
    }
});


export const { updateBus, setCurrentSearchBus } = busSlice.actions;
export const { updateAccount, setCurrentSearchAccount } = accountSlide.actions;
export const { updateDriver, setCurrentSearchDriver } = driverSlide.actions;
export const { updateStation, setCurrentSearchStation } = stationSlide.actions;
export const { updateRoute, setCurrentSearchRoute } = routeSlide.actions;


