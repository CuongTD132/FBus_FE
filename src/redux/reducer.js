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
        setcurrentSearchDriver: (state, action) => {
            state.currentSearchDriver = action.payload;
        },
    }
});
export const { updateBus, setCurrentSearchBus } = busSlice.actions;
export const { updateAccount, setCurrentSearchAccount } = accountSlide.actions;
export const { updateDriver, setcurrentSearchDriver } = driverSlide.actions;
