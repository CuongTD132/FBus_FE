import axios from "axios";
const URL = process.env.REACT_APP_SERVER;
const END_POINTS = {
    getMultiCoordinations: '/api/Coordination',
    addCoordination: '/api/Coordination',
    updateCoordination: '/api/Coordination'
}


export const getMultiCoordinations = async (data) => {
    return await axios.get(`${URL}/${END_POINTS.getMultiCoordinations}`, {
        params: {
            BusId: data.beginning,
            DriverId: data.destination,
            RouteId: data.routeId,
            PageIndex: data.pageIndex,
            PageSize: data.pagesize,
            OrderBy: data.OrderBy,
            Direction: data.direction
        }
    })
}


export const addCoordination = async (coordination) => {
    return await axios.post(`${URL}/${END_POINTS.addCoordination}`, {
        BusId: coordination.beginning,
        DriverId: coordination.destination,
        RouteId: coordination.routeId,
        PageIndex: coordination.pageIndex,
        PageSize: coordination.pagesize,
        OrderBy: coordination.OrderBy,
        Direction: coordination.direction
    })
}

export const updateRoute = async (coordination) => {
    return await axios.put(`${URL}/${END_POINTS.updateRoute}/${coordination.id}`, {
        BusId: coordination.beginning,
        DriverId: coordination.destination,
        RouteId: coordination.routeId,
        PageIndex: coordination.pageIndex,
        PageSize: coordination.pagesize,
        OrderBy: coordination.OrderBy,
        Direction: coordination.direction
    })
}