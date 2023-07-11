import axios from "axios";
const URL = process.env.REACT_APP_SERVER;
const END_POINTS = {
    addRoute: 'api/Routes',
    updateRoute: 'api/Routes',
    getSingleRoute: 'api/Routes',
    getMultiRoutes: 'api/Routes',
    enableRoute: 'api/Routes',
    deleteRoute: 'api/Routes'
}


export const addRouteAPI = async (route) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const formData = new FormData();
    formData.set("beginning", route.email);
    formData.set("destination", route.code);
    formData.set("distance", route.fullName);
    formData.set("stationIds", route.stationIds);
    if (user && user.accessToken) {
        return await axios.post(`${URL}/${END_POINTS.addRoute}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}`,
                    "Content-Type": "application/json",
                },
            });
    }
}

export const updateRouteAPI = async (route, id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const formData = new FormData();
    formData.set("beginning", route.email);
    formData.set("destination", route.code);
    formData.set("distance", route.fullName);
    formData.set("stationIds", route.stationIds);
    if (user && user.accessToken) {
        return await axios.post(`${URL}/${END_POINTS.updateRoute}`, formData, {
                headers: {
                    Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}`,
                    "Content-Type": "application/json",
                },
            });
    }
};


export const getSingleRoute = async (id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        return await axios.get(`${URL}/${END_POINTS.getSingleRoute}/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
            })
    }
}

export const getMultiRoutesAPI = async (data) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        return await axios.get(`${URL}/${END_POINTS.getMultiRoutes}`, {
            params: {
                ...data
            },
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
            },
        })
    }
}

export const getAllRoutes = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        return await axios.get(`${URL}/${END_POINTS.getMultiRoutes}`, {
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
            },
        })
    }
}


export const deleteRouteAPI = async (routId) => {
    return await axios.delete(`${URL}/${END_POINTS.deleteRoute}/${routId}`,
        {
            headers: {
                Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).accessToken}`,
            },
        });
}


export const toggleStatusAPI = async (routId, status) => {
    return await axios.patch(`${URL}/${END_POINTS.enableRoute}/${routId}`,
        status,
        {
            headers: {
                Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).accessToken}`,
                "Content-Type": "application/json"
            },
        })
}

