import axios from "axios";
const URL = process.env.REACT_APP_SERVER;
const END_POINTS = {
    addDriver: 'api/Drivers',
    updateDriver: 'api/Drivers',
    getSingleDriver: 'api/Drivers',
    getMultiDrivers: 'api/Drivers',
    enableDriver: 'api/Drivers',
    deleteDriver: 'api/Drivers'
}

export const addDriverAPI = async (driver) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const formData = new FormData();
    formData.set("email", driver.email);
    formData.set("code", driver.code);
    formData.set("fullName", driver.fullName);
    formData.set("gender", driver.gender);
    formData.set("idCardNumber", driver.idCardNumber);
    formData.set("address", driver.address);
    formData.set("phoneNumber", driver.phoneNumber);
    formData.set("personalEmail", driver.personalEmail);
    formData.set("dateOfBirth", driver.dateOfBirth);
    formData.set("avatarFile", driver.avatarFile); // Use 'avatarFile' as the key
    if (user && user.accessToken) {
        return await axios.post(`${URL}/${END_POINTS.addDriver}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                    "Content-Type": "multipart/form-data", // Set the content type
                },
            });
    }
};

export const updateDriverAPI = async (driver, id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const formData = new FormData();
    formData.append("email", driver.email);
    formData.append("code", driver.code);
    formData.append("fullName", driver.fullName);
    formData.append("gender", driver.gender);
    formData.append("idCardNumber", driver.idCardNumber);
    formData.append("address", driver.address);
    formData.append("phoneNumber", driver.phoneNumber);
    formData.append("personalEmail", driver.personalEmail);
    formData.append("dateOfBirth", driver.dateOfBirth);
    formData.append("avatarFile", driver.avatarFile);
    if (user && user.accessToken) {
    return await axios.put(`${URL}/${END_POINTS.updateDriver}/${id}`, formData, {
        headers: {
            Authorization: `Bearer ${user.accessToken}`,
            "Content-Type": "multipart/form-data",
        },
    });
}
};

export const getSingleDriver = async (id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
    return await axios.get(`${URL}/${END_POINTS.getSingleDriver}/${id}`,
        {
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
            },
        })
    }
}

export const getMultiDriversAPI = async (data) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
    return await axios.get(`${URL}/${END_POINTS.getMultiDrivers}`, {
        params: {
            ...data
        },
        headers: {
            Authorization: `Bearer ${user.accessToken}`,
        },
    })
}
}

export const getAllDrivers = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
    return await axios.get(`${URL}/${END_POINTS.getMultiDrivers}`, {
        headers: {
            Authorization: `Bearer ${user.accessToken}`,
        },
    })
}
}


export const deleteDriverAPI = async (driverId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
    return await axios.delete(`${URL}/${END_POINTS.deleteDriver}/${driverId}`,
        {
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
            },
        });
    }
}

export const toggleStatusAPI = async (driverId, status) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
    return await axios.patch(`${URL}/${END_POINTS.enableDriver}/${driverId}`,
        status,
        {
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
                "Content-Type": "application/json"
            },
        })
    }
}
