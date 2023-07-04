import axios from "axios";
const URL = process.env.REACT_APP_SERVER;
const END_POINTS = {
    addBus: 'api/Buses',
    updateBus: 'api/Buses',
    getSingleBus: 'api/Buses',
    getMultiBuses: 'api/Buses',
    deleteBus: 'api/Buses',
    enableBus: 'api/Buses',
}


export const addBusAPI = async (bus) => {
    const formData = new FormData();
    formData.append('code', bus.code);
    formData.append('licensePlate', bus.licensePlate);
    formData.append('brand', bus.brand);
    formData.append('model', bus.model);
    formData.append('color', bus.color);
    formData.append('seat', bus.seat);
    formData.append('dateOfRegistration', bus.dateOfRegistration);
    return await axios.post(`${URL}/${END_POINTS.addBus}`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).accessToken}`,
            },
        }
    )
}

export const updateBusAPI = async (bus, id) => {
    const formData = new FormData();
    formData.append('code', bus.code);
    formData.append('licensePlate', bus.licensePlate);
    formData.append('brand', bus.brand);
    formData.append('model', bus.model);
    formData.append('color', bus.color);
    formData.append('seat', bus.seat);
    formData.append('dateOfRegistration', bus.dateOfRegistration);
    console.log(`Update data from API: ${bus}`)
    return await axios.put(`${URL}/${END_POINTS.updateBus}/${id}`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).accessToken}`,
            },
        }
    )
}

export const getSingleBus = async (id) => {
    return await axios.get(`${URL}/${END_POINTS.getSingleBus}/${id}`,
        {
            headers: {
                Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).accessToken}`,
            },
        })
}

export const getMultiBusesAPI = async (data) => {
    return await axios.get(`${URL}/${END_POINTS.getMultiBuses}`, {
        params: {
            ...data
        },
        headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).accessToken}`,
        },
    })
}

export const getAllBuses = async () => {
    return await axios.get(`${URL}/${END_POINTS.getMultiBuses}`, {
        headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).accessToken}`,
        },
    })
}

export const deleteBusAPI = async (busId) => {
    console.log(`[FROM API]: busId ${busId}`)
    return await axios.delete(`${URL}/${END_POINTS.deleteBus}/${busId}`,
        {
            headers: {
                Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).accessToken}`,
            },
        });
}

export const toggleStatusAPI = async (busId, status) => {
    return await axios.patch(`${URL}/${END_POINTS.enableBus}/${busId}`,
        status,
        {
            headers: {
                Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).accessToken}`,
                "Content-Type": "application/json"
            },
        })
}