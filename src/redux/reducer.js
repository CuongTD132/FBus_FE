import { createSlice } from "@reduxjs/toolkit";

export const  busSlice = createSlice({
    name: 'BUSES',
    initialState: {
        value: [],
        currentSearch: ""
    },
    reducers: {
        updateBus: (state, action) => {
            state.value = action.payload;
        },
        setCurrentSearch: (state, action) => {
            state.currentSearch = action.payload;
        },
    }
});

export const { updateBus, setCurrentSearch } = busSlice.actions;