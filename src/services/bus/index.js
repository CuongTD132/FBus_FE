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
    const user = JSON.parse(localStorage.getItem('user'));
    const formData = new FormData();
    formData.append('code', bus.code);
    formData.append('licensePlate', bus.licensePlate);
    formData.append('brand', bus.brand);
    formData.append('model', bus.model);
    formData.append('color', bus.color);
    formData.append('seat', bus.seat);
    formData.append('dateOfRegistration', bus.dateOfRegistration);
    if (user && user.accessToken) {
        return await axios.post(`${URL}/${END_POINTS.addBus}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
            }
        )
    }
}

export const updateBusAPI = async (bus, id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const formData = new FormData();
    formData.append('code', bus.code);
    formData.append('licensePlate', bus.licensePlate);
    formData.append('brand', bus.brand);
    formData.append('model', bus.model);
    formData.append('color', bus.color);
    formData.append('seat', bus.seat);
    formData.append('dateOfRegistration', bus.dateOfRegistration);
    console.log(`Update data from API: ${bus}`)
    if (user && user.accessToken) {
        return await axios.put(`${URL}/${END_POINTS.updateBus}/${id}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
            }
        )
    }
}

export const getSingleBus = async (id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        return await axios.get(`${URL}/${END_POINTS.getSingleBus}/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
            })
    }
}

export const getMultiBusesAPI = async (data) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        return await axios.get(`${URL}/${END_POINTS.getMultiBuses}`, {
            params: {
                ...data
            },
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
            },
        })
    }
}

export const getAllBuses = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        return await axios.get(`${URL}/${END_POINTS.getMultiBuses}`, {
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
            },
        })
    }
}

export const deleteBusAPI = async (busId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        return await axios.delete(`${URL}/${END_POINTS.deleteBus}/${busId}`,
            {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });
    }
}

export const toggleStatusAPI = async (busId, status) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        return await axios.patch(`${URL}/${END_POINTS.enableBus}/${busId}`,
            status,
            {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                    "Content-Type": "application/json"
                },
            })
    }
}