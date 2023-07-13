import axios from "axios";
const URL = process.env.REACT_APP_SERVER;
const END_POINTS = {
    getMultiCoordinations: 'api/Coordinations',
    addCoordination: 'api/Coordinations',
    updateCoordination: 'api/Coordinations',
    getSingleCoordination: 'api/Coordinations',
    patchCoordination: 'api/Coordinations',
    deleteCoordination: 'api/Coordinations'
}


export const getMultiCoordinationsAPI = async (data) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        return await axios.get(`${URL}/${END_POINTS.getMultiCoordinations}`, {
            params: {
                ...data
            },
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
            },
        })
    }
}


// export const addCoordinationAPI = async (coord) => {
//     const user = JSON.parse(localStorage.getItem('user'));
//     const formData = new FormData();
//     formData.append('driverId', coord.driverId);
//     formData.append('busId', coord.busId);
//     formData.append('routeId ', coord.routeId );
//     formData.append('note', coord.note);
//     formData.append('dateLine', coord.dateLine);
//     formData.append('dueDate', coord.dueDate);
//     if (user && user.accessToken) {
//         return await axios.post(`${URL}/${END_POINTS.addCoordination}`,
//             formData,
//             {
//                 headers: {
//                     Authorization: `Bearer ${user.accessToken}`,
//                     "Content-Type": "multipart/form-data", // Set the content type
//                 },
//             });
//     }
// };

// export const updateCoordinationAPI = async (coord, id) => {
//     const user = JSON.parse(localStorage.getItem('user'));
//     const formData = new FormData();
//     formData.append('driverId', coord.driverId);
//     formData.append('busId', coord.busId);
//     formData.append('routeId ', coord.routeId );
//     formData.append('note', coord.note);
//     formData.append('dateLine', coord.dateLine);
//     formData.append('dueDate', coord.dueDate);
//     if (user && user.accessToken) {
//         return await axios.put(`${URL}/${END_POINTS.updateCoordination}/${id}`,
//             formData,
//             {
//                 headers: {
//                     Authorization: `Bearer ${user.accessToken}`,
//                     "Content-Type": "multipart/form-data",
//                 },
//             }
//         );
//     }
// };

export const getAllCoordinations = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        return await axios.get(`${URL}/${END_POINTS.getMultiCoordinations}`, {
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
            },
        })
    }
}

export const getSingleCoordination = async (id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        return await axios.get(`${URL}/${END_POINTS.getSingleCoordination}/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
            })
    }
}

export const toggleStatusAPI = async (coordinationId, status) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        return await axios.patch(`${URL}/${END_POINTS.patchCoordination}/${coordinationId}`,
            status,
            {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                    "Content-Type": "application/json"
                },
            })
    }
}

export const deleteCoordinationAPI = async (coordinationId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        return await axios.delete(`${URL}/${END_POINTS.deleteCoordination}/${coordinationId}`,
            {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });
    }
}