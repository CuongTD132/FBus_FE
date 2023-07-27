import axios from "axios";
const URL = process.env.REACT_APP_SERVER;
const END_POINTS = {
    getMultiTrips: 'api/Trips',
    addTrip: 'api/Trips',
    updateTrip: 'api/Trips',
    getSingleTrip: 'api/Trips',
    patchTrip: 'api/Trips',
    deleteTrip: 'api/Trips'
}


export const getMultiTripsAPI = async (data) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        return await axios.get(`${URL}/${END_POINTS.getMultiTrips}`, {
            params: {
                ...data
            },
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
            },
        })
    }
}


// export const addTripAPI = async (coord) => {
//     const user = JSON.parse(localStorage.getItem('user'));
//     const formData = new FormData();
//     formData.append('driverId', coord.driverId);
//     formData.append('busId', coord.busId);
//     formData.append('routeId ', coord.routeId );
//     formData.append('note', coord.note);
//     formData.append('dateLine', coord.dateLine);
//     formData.append('dueDate', coord.dueDate);
//     if (user && user.accessToken) {
//         return await axios.post(`${URL}/${END_POINTS.addTrip}`,
//             formData,
//             {
//                 headers: {
//                     Authorization: `Bearer ${user.accessToken}`,
//                     "Content-Type": "multipart/form-data", // Set the content type
//                 },
//             });
//     }
// };

// export const updateTripAPI = async (coord, id) => {
//     const user = JSON.parse(localStorage.getItem('user'));
//     const formData = new FormData();
//     formData.append('driverId', coord.driverId);
//     formData.append('busId', coord.busId);
//     formData.append('routeId ', coord.routeId );
//     formData.append('note', coord.note);
//     formData.append('dateLine', coord.dateLine);
//     formData.append('dueDate', coord.dueDate);
//     if (user && user.accessToken) {
//         return await axios.put(`${URL}/${END_POINTS.updateTrip}/${id}`,
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

export const getAllTrips = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        return await axios.get(`${URL}/${END_POINTS.getMultiTrips}`, {
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
            },
        })
    }
}

export const getSingleTrip = async (id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        return await axios.get(`${URL}/${END_POINTS.getSingleTrip}/${id}`,
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
        return await axios.patch(`${URL}/${END_POINTS.patchTrip}/${coordinationId}`,
            status,
            {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                    "Content-Type": "application/json"
                },
            })
    }
}

export const deleteTripAPI = async (coordinationId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        return await axios.delete(`${URL}/${END_POINTS.deleteTrip}/${coordinationId}`,
            {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });
    }
}