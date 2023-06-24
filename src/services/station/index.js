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


export const getMultiStations = async (data) => {
    return await axios.get(`${URL}/${END_POINTS.getMultiStations}`, {
        params: {
            Code : data.beginning,
            PageIndex: data.destination,
            PageSize: data.pagesize,
            OrderBy: data.OrderBy,
            Direction: data.direction
        }
    })
}


export const addStation = async (station) => {
    return await axios.post(`${URL}/${END_POINTS.addStation}`, {
        Code: station.code,
        Name: station.name,
        AddressNumber: code.addressNumber,
        Street: station.street,
        Ward: station.ward,
        District: station.district,
        City: station.city,
        ImageFile: station.imageFile,
        Longitude: station.longtitude,
        Latitude: station.latitude,
        status: station.status,
    })
}

export const updateStation = async (station) => {
    return await axios.put(`${URL}/${END_POINTS.updateStation}/${station.id}`, {
        Code: station.code,
        Name: station.name,
        AddressNumber: code.addressNumber,
        Street: station.street,
        Ward: station.ward,
        District: station.district,
        City: station.city,
        ImageFile: station.imageFile,
        Longitude: station.longtitude,
        Latitude: station.latitude,
        status: station.status,
    })
}

export const getSingleStation = async (id) => {
    return await axios.get(`${URL}/${END_POINTS.getSingleStation}/${id}`)
}

export const patchStation = async (data) => {
    return await axios.patch(`${URL}/${END_POINTS.patchStation}/${data.id}`, {

    })
}

export const deleteStation = async (id) => {
    return await axios.delete(`${URL}/${END_POINTS.deleteStation}/${id}`)
}