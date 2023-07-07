import axios from "axios";
const URL = process.env.REACT_APP_SERVER;
const END_POINTS = {
    getMultiStations: '/api/Stations',
    addStation: '/api/Stations',
    updateStation: '/api/Stations',
    getSingleStation: '/api/Stations',
    patchStation: '/api/Stations',
    deleteStation: '/api/Stations'
}


export const getMultiStationsAPI = async (data) => {
    return await axios.get(`${URL}/${END_POINTS.getMultiStations}`, {
        params: {
            ...data
        },
        headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).accessToken}`,
        },
    })
}


export const addStationAPI = async (station) => {
    const formData = new FormData();
    formData.append('code', station.code);
    formData.append('name', station.name);
    formData.append('addressNumber', station.addressNumber);
    formData.append('street', station.street);
    formData.append('ward', station.ward);
    formData.append('district', station.district);
    formData.append('city', station.city);
    formData.append('imageFile', station.imageFile);
    formData.append('longtitude', station.longtitude);
    formData.append('latitude', station.latitude);
    formData.append('status', station.status);
    return await axios.post(`${URL}/${END_POINTS.addStation}`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).accessToken}`,
            },
        }
    )
}

export const updateStationAPI = async (station, id) => {
    const formData = new FormData();
    formData.append('code', station.code);
    formData.append('name', station.name);
    formData.append('addressNumber', station.addressNumber);
    formData.append('street', station.street);
    formData.append('ward', station.ward);
    formData.append('district', station.district);
    formData.append('city', station.city);
    formData.append('imageFile', station.imageFile);
    formData.append('longtitude', station.longtitude);
    formData.append('latitude', station.latitude);
    formData.append('status', station.status);
    return await axios.put(`${URL}/${END_POINTS.updateStation}/${id}`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).accessToken}`,
            },
        }
    )
}

export const getAllStations = async () => {
    return await axios.get(`${URL}/${END_POINTS.getMultiStations}`, {
        headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).accessToken}`,
        },
    })
}

export const getSingleStation = async (id) => {
    return await axios.get(`${URL}/${END_POINTS.getSingleStation}/${id}`,
        {
            headers: {
                Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).accessToken}`,
            },
        })
}

export const toggleStatusAPI = async (stationId, status) => {
    return await axios.patch(`${URL}/${END_POINTS.patchStation}/${stationId}`, 
    status,
    {
        headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).accessToken}`,
            "Content-Type": "application/json"
        },
    })
}

export const deleteStationAPI = async (stationId) => {
    console.log(`[FROM API]: busId ${stationId}`)
    return await axios.delete(`${URL}/${END_POINTS.deleteStation}/${stationId}`,
        {
            headers: {
                Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).accessToken}`,
            },
        });
}