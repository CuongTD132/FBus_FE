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

export const addBus = async (bus) => {
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
                Authorization: `Bearer ${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6IjMiLCJSb2xlIjoiQURNSU4iLCJleHAiOjE2OTAyNzUzMTgsImlzcyI6IkZCdXNfU1dQIiwiYXVkIjoiRkJ1c19TV1AifQ.UQGNjS5BPJfY63oh8JfaTcC-CxoiWfzaFdtSPHjwe9A'}`,
            },
        }
    )
}

export const updateBusAPI = async (bus, id) => {
    console.log(`Update data from API: ${bus}`)
    return await axios.put(`${URL}/${END_POINTS.updateBus}/${id}`,
        bus,
        {
            headers: {
                Authorization: `Bearer ${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6IjMiLCJSb2xlIjoiQURNSU4iLCJleHAiOjE2OTAyNzUzMTgsImlzcyI6IkZCdXNfU1dQIiwiYXVkIjoiRkJ1c19TV1AifQ.UQGNjS5BPJfY63oh8JfaTcC-CxoiWfzaFdtSPHjwe9A'}`,
            },
        }
    )
}

export const getSingleBus = async (id) => {
    return await axios.get(`${URL}/${END_POINTS.getSingleBus}/${id}`,
        {
            headers: {
                Authorization: `Bearer ${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6IjMiLCJSb2xlIjoiQURNSU4iLCJleHAiOjE2OTAyNzUzMTgsImlzcyI6IkZCdXNfU1dQIiwiYXVkIjoiRkJ1c19TV1AifQ.UQGNjS5BPJfY63oh8JfaTcC-CxoiWfzaFdtSPHjwe9A'}`,
            },
        })
}

export const getMultiBuses = async (data) => {
    return await axios.get(`${URL}/${END_POINTS.getMultiBuses}`, {
        params: {
            Code: data.code ?? "",
            LicensePlate: data.licensePlate ?? "",
            PageIndex: data.pageIndex ?? "",
            PageSize: data.pageSize ?? "",
            OrderBy: data.orderBy ?? "",
            Direction: data.direction ?? ""
        },
        headers: {
            Authorization: `Bearer ${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6IjMiLCJSb2xlIjoiQURNSU4iLCJleHAiOjE2OTAyNzUzMTgsImlzcyI6IkZCdXNfU1dQIiwiYXVkIjoiRkJ1c19TV1AifQ.UQGNjS5BPJfY63oh8JfaTcC-CxoiWfzaFdtSPHjwe9A'}`,
        },
    })
}

export const getAllBuses = async (data) => {
    return await axios.get(`${URL}/${END_POINTS.getMultiBuses}`, {
        headers: {
            Authorization: `Bearer ${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6IjMiLCJSb2xlIjoiQURNSU4iLCJleHAiOjE2OTAyNzUzMTgsImlzcyI6IkZCdXNfU1dQIiwiYXVkIjoiRkJ1c19TV1AifQ.UQGNjS5BPJfY63oh8JfaTcC-CxoiWfzaFdtSPHjwe9A'}`,
        },
    })
}

export const deleteBusAPI = async (busId) => {
    console.log(`[FROM API]: busId ${busId}`)
    return await axios.delete(`${URL}/${END_POINTS.deleteBus}/${busId}`,
        {
            headers: {
                Authorization: `Bearer ${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6IjMiLCJSb2xlIjoiQURNSU4iLCJleHAiOjE2OTAyNzUzMTgsImlzcyI6IkZCdXNfU1dQIiwiYXVkIjoiRkJ1c19TV1AifQ.UQGNjS5BPJfY63oh8JfaTcC-CxoiWfzaFdtSPHjwe9A'}`,
            },
        });
}

export const updateStatusAPI = async (busId, status) => {
    return await axios.patch(`${URL}/${END_POINTS.enableBus}/${busId}`,
        {
            status: status
        },
        {
            headers: {
                Authorization: `Bearer ${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6IjMiLCJSb2xlIjoiQURNSU4iLCJleHAiOjE2OTAyNzUzMTgsImlzcyI6IkZCdXNfU1dQIiwiYXVkIjoiRkJ1c19TV1AifQ.UQGNjS5BPJfY63oh8JfaTcC-CxoiWfzaFdtSPHjwe9A'}`,
            },
        })
}