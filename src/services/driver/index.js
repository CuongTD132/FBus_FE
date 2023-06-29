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

export const addDriver = async (driver) => {
    const formData = new FormData();
    formData.append('email', driver.email);
    formData.append('code', driver.code);
    formData.append('fullName', driver.fullName);
    formData.append('gender', driver.gender);
    formData.append('idCardNumber', driver.idCardNumber);
    formData.append('address', driver.address);
    formData.append('phoneNumber', driver.phoneNumber);
    formData.append('personalEmail', driver.personalEmail);
    formData.append('dateOfBirth', driver.dateOfBirth);
    formData.append('avatarFile', driver.avatarFile);
    return await axios.post(`${URL}/${END_POINTS.addDriver}`, 
        formData,
        {
            headers: {
                Authorization: `Bearer ${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6IjMiLCJSb2xlIjoiQURNSU4iLCJleHAiOjE2OTAyNzUzMTgsImlzcyI6IkZCdXNfU1dQIiwiYXVkIjoiRkJ1c19TV1AifQ.UQGNjS5BPJfY63oh8JfaTcC-CxoiWfzaFdtSPHjwe9A'}`,
            },
        }
    )
}

export const updateDriverAPI = async (driver, id) => {
    const formData = new FormData();
    formData.append('email', driver.email);
    formData.append('code', driver.code);
    formData.append('fullName', driver.fullName);
    formData.append('gender', driver.gender);
    formData.append('idCardNumber', driver.idCardNumber);
    formData.append('address', driver.address);
    formData.append('phoneNumber', driver.phoneNumber);
    formData.append('personalEmail', driver.personalEmail);
    formData.append('dateOfBirth', driver.dateOfBirth);
    formData.append('avatarFile', driver.avatarFile);
    return await axios.put(`${URL}/${END_POINTS.updateDriver}/${id}`, 
        formData,
        {
            headers: {
                Authorization: `Bearer ${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6IjMiLCJSb2xlIjoiQURNSU4iLCJleHAiOjE2OTAyNzUzMTgsImlzcyI6IkZCdXNfU1dQIiwiYXVkIjoiRkJ1c19TV1AifQ.UQGNjS5BPJfY63oh8JfaTcC-CxoiWfzaFdtSPHjwe9A'}`,
            },
        }
    )
}

export const getSingleDriver = async (id) => {
    return await axios.get(`${URL}/${END_POINTS.getSingleDriver}/${id}`,
        {
            headers: {
                Authorization: `Bearer ${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6IjMiLCJSb2xlIjoiQURNSU4iLCJleHAiOjE2OTAyNzUzMTgsImlzcyI6IkZCdXNfU1dQIiwiYXVkIjoiRkJ1c19TV1AifQ.UQGNjS5BPJfY63oh8JfaTcC-CxoiWfzaFdtSPHjwe9A'}`,
            },
        })
}

export const getMultiDrivers = async (data) => {
    return await axios.get(`${URL}/${END_POINTS.getMultiDrivers}`, {
        params: {
            Code: data.code ?? "",
            Email: data.email ?? "",
            PageIndex: data.pageIndex ?? "",
            PageSize: data.pagesize ?? "",
            OrderBy: data.OrderBy ?? "",
            Direction: data.direction ?? ""
        },
        headers: {
            Authorization: `Bearer ${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6IjMiLCJSb2xlIjoiQURNSU4iLCJleHAiOjE2OTAyNzUzMTgsImlzcyI6IkZCdXNfU1dQIiwiYXVkIjoiRkJ1c19TV1AifQ.UQGNjS5BPJfY63oh8JfaTcC-CxoiWfzaFdtSPHjwe9A'}`,
        },
    })
}

export const getAllDrivers = async (data) => {
    return await axios.get(`${URL}/${END_POINTS.getMultiDrivers}`, {
        headers: {
            Authorization: `Bearer ${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6IjMiLCJSb2xlIjoiQURNSU4iLCJleHAiOjE2OTAyNzUzMTgsImlzcyI6IkZCdXNfU1dQIiwiYXVkIjoiRkJ1c19TV1AifQ.UQGNjS5BPJfY63oh8JfaTcC-CxoiWfzaFdtSPHjwe9A'}`,
        },
    })
}
export const enableStatusAPI = async (driverId) => {
    return await axios.patch(`${URL}/${END_POINTS.enableDriver}/${driverId}`,
    'ACTIVE',
    {
        headers: {
            Authorization: `Bearer ${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6IjMiLCJSb2xlIjoiQURNSU4iLCJleHAiOjE2OTAyNzUzMTgsImlzcyI6IkZCdXNfU1dQIiwiYXVkIjoiRkJ1c19TV1AifQ.UQGNjS5BPJfY63oh8JfaTcC-CxoiWfzaFdtSPHjwe9A'}`,
            "Content-Type": "application/json"
        },
    })
}

export const deleteDriverAPI = async (driverId) => {
    console.log(`[FROM API]: driverId ${driverId}`)
    return await axios.delete(`${URL}/${END_POINTS.deleteDriver}/${driverId}`,
        {
            headers: {
                Authorization: `Bearer ${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6IjMiLCJSb2xlIjoiQURNSU4iLCJleHAiOjE2OTAyNzUzMTgsImlzcyI6IkZCdXNfU1dQIiwiYXVkIjoiRkJ1c19TV1AifQ.UQGNjS5BPJfY63oh8JfaTcC-CxoiWfzaFdtSPHjwe9A'}`,
            },
        });
}