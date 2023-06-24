import axios from "axios";
const URL = process.env.REACT_APP_SERVER;
const END_POINTS = {
    getMultiRoutes: '/api/Routes',
    addRoute: '/api/Routes',
    updateRoute: '/api/Routes',
    getSingleRoute: '/api/Routes',
    patchRoute: '/api/Routes',
    deleteRoute: '/api/Routes'
}


export const getMultiRoute = async (data) => {
    return await axios.get(`${URL}/${END_POINTS.getMultiRoutes}`, {
        params: {
            Beginning : data.beginning,
            Destination: data.destination,
            PageIndex: code.pageIndex,
            PageSize: data.pagesize,
            OrderBy: data.OrderBy,
            Direction: data.direction
        }
    })
}


export const addRoute = async (route) => {
    return await axios.post(`${URL}/${END_POINTS.addRoute}`, {
        beginning: route.beginning,
        destination: route.destination,
        routeStations: code.routeStations,
        distance: route.distance,
        status: route.status
    })
}

export const updateRoute = async (route) => {
    return await axios.put(`${URL}/${END_POINTS.updateRoute}/${route.id}`, {
        beginning: route.beginning,
        destination: route.destination,
        routeStations: code.routeStations,
        distance: route.distance,
        status: route.status
    })
}

export const getSingleRoute = async (id) => {
    return await axios.get(`${URL}/${END_POINTS.getSingleRoute}/${id}`)
}

export const patchRoute = async (data) => {
    return await axios.patch(`${URL}/${END_POINTS.patchRoute}/${data.id}`, {

    })
}

export const deleteRoute = async (id) => {
    return await axios.delete(`${URL}/${END_POINTS.deleteRoute}/${id}`)
}