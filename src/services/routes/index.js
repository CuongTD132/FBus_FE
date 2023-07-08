import axios from "axios";
import { Loader } from "@googlemaps/js-api-loader"
const google = window.google;
const URL = process.env.REACT_APP_SERVER;
const mapApiKey = process.env.REACT_APP_GOOGLE_API_KEY;
const END_POINTS = {
    addRoute: '/api/Routes',
    updateRoute: '/api/Routes',
    getSingleRoute: '/api/Routes',
    getMultiRoutes: '/api/Routes',
    enableRoute: '/api/Routes',
    deleteRoute: '/api/Routes'
}

export const mapAPI = async (mapDiv) => {
    const loader = new Loader({
        apiKey: mapApiKey,
        version: "weekly",
    });

    await loader.load().catch((error) => {
        console.error("Error loading Google Maps API:", error);
        throw error;
    });

    const map = new google.maps.Map(mapDiv, {
        center: { lat: 10.8413277989493, lng: 106.81052672697601 },
        zoom: 8,
    });
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        return map;
    }
};

export const addRouteAPI = async (route) => {
    const payload = {
        beginning: route.beginning,
        destination: route.destination,
        routeStations: [
            {
                routeId: 0,
                stationId: 0,
                stationInputDTO: {
                    code: "string",
                    name: "string",
                    addressNumber: "string",
                    street: "string",
                    ward: "string",
                    district: "string",
                    city: "string",
                    imageFile: "string",
                    longitude: 0,
                    latitude: 0,
                    status: "string",
                },
                stationOrder: 0,
            },
        ],
        distance: 0,
        status: "string",
    };

    return await axios.post(`${URL}/${END_POINTS.addRoute}`, payload, {
        headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}`,
            "Content-Type": "application/json",
        },
    });
}

export const updateRouteAPI = async (route, id) => {
    const payload = {
        beginning: route.beginning,
        destination: route.destination,
        routeStations: [
            {
                routeId: 0,
                stationId: 0,
                stationInputDTO: {
                    code: "string",
                    name: "string",
                    addressNumber: "string",
                    street: "string",
                    ward: "string",
                    district: "string",
                    city: "string",
                    imageFile: "string",
                    longitude: 0,
                    latitude: 0,
                    status: "string"
                },
                stationOrder: 0
            }
        ],
        distance: 0,
        status: "string"
    };

    return await axios.put(`${URL}/${END_POINTS.updateRoute}/${id}`, payload, {
        headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}`,
            "Content-Type": "application/json",
        },
    });
};


export const getSingleRoute = async (id) => {
    return await axios.get(`${URL}/${END_POINTS.getSingleRoute}/${id}`,
        {
            headers: {
                Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).accessToken}`,
            },
        })
}

export const getMultiRouteAPI = async (data) => {
    return await axios.get(`${URL}/${END_POINTS.getMultiRoutes}`, {
        params: {
            ...data
        },
        headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).accessToken}`,
        },
    })
}

export const getAllRoutes = async () => {
    return await axios.get(`${URL}/${END_POINTS.getMultiRoutes}`, {
        headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).accessToken}`,
        },
    })
}


export const deleteRoute = async (routId) => {
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

