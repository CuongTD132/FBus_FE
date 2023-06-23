import axios from "axios";
const URL = process.env.REACT_APP_SERVER;
const END_POINTS = {
    addBus: '/api/Buses',
    updateBus: '/api/Buses',
    getSingleBus: '/api/Buses',
    getMultiBuses: '/api/Buses',
}

export const addBus = async (bus) => {
    return await axios.post(END_POINTS.addBus, {
        Code: bus.code,
        LicensePlate: bus.licensePlate,
        Brand: code.brand,
        Model: bus.model,
        Color: bus.color,
        Seat: bus.seat,
        DateOfRegistration: bus.dateOfRegistration
    })
}

export const updateBus = async (bus) => {
    return await axios.put(`${END_POINTS.updateBus}/${bus.id}`, {
        Code: bus.code,
        LicensePlate: bus.licensePlate,
        Brand: code.brand,
        Model: bus.model,
        Color: bus.color,
        Seat: bus.seat,
        DateOfRegistration: bus.dateOfRegistration
    })
}

export const getSingleBus = async (id) => {
    return await axios.get(`${END_POINTS.getSingleBus}/${id}`)
}

export const getMultiBuses = async (data) => {
    return await axios.get(END_POINTS.getMultiBuses, {
        params: {
            Code: data.code,
            LicensePlate: data.licensePlate,
            PageIndex: data.pageIndex,
            PageSize: data.pageSize,
            OrderBy: data.orderBy,
            Direction: data.direction
        }
    })
}