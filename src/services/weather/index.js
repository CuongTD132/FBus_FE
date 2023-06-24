import axios from "axios";
const URL = process.env.REACT_APP_SERVER;
const END_POINTS = {
    getWeather: '/api/WeatherForecast'
}


export const getWeather = async () => {
    return await axios.get(`${URL}/${END_POINTS.getWeather}`)
}

