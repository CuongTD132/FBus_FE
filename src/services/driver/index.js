import axios from "axios";
const URL = process.env.REACT_APP_SERVER;
const END_POINTS = {
    addDriver: '/api/Drivers',
    updateDriver: '/api/Drivers',
    getSingleDriver: '/api/Drivers',
    getMultiDrivers: '/api/Drivers',
    patchDriver: '/api/Drivers',
    deleteDriver: '/api/Drivers'
}

export const addDriver = async (driver) => {
    return await axios.post(`${URL}/${END_POINTS.addDriver}`, {
        Email: driver.email,
        Code: driver.code,
        FullName: code.fullName,
        Gender: driver.gender,
        IdCardNumber: driver.idCardNumber,
        Address: driver.address,
        PhoneNumber: driver.phoneNumber,
        PersonalEmail: driver.personalEmail,
        DateOfBirth: driver.dateOfBirth,
        AvatarFile: driver.avatarFile,
    })
}

export const updateDriver = async (driver) => {
    return await axios.put(`${URL}/${END_POINTS.updateDriver}/${driver.id}`, {
        Email: driver.email,
        Code: driver.code,
        FullName: code.fullName,
        Gender: driver.gender,
        IdCardNumber: driver.idCardNumber,
        Address: driver.address,
        PhoneNumber: driver.phoneNumber,
        PersonalEmail: driver.personalEmail,
        DateOfBirth: driver.dateOfBirth,
        AvatarFile: driver.avatarFile,
    })
}

export const getSingleDriver = async (id) => {
    return await axios.get(`${URL}/${END_POINTS.getSingleDriver}/${id}`)
}

export const getMultiDrivers = async (data) => {
    return await axios.get(`${URL}/${END_POINTS.getMultiDrivers}`, {
        params: {
            Code: data.code,
            Email: data.email,
            PageIndex: code.pageIndex,
            PageSize: data.pagesize,
            OrderBy: data.OrderBy,
            Direction: data.direction
        }
    })
}

export const patchDriver = async (data) => {
    return await axios.patch(`${URL}/${END_POINTS.patchDriver}/${data.id}`, {

    })
}

export const deleteDriver = async (id) => {
    return await axios.delete(`${URL}/${END_POINTS.deleteDriver}/${id}`)
}