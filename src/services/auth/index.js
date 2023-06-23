import axios from "axios";
const URL = process.env.REACT_APP_SERVER;
const END_POINTS = {
    google_signIn: '/api/Auth'
}

export const loginWithGoogle = () => {
    axios.post(END_POINTS.google_signIn)
        .then(res => {
            console.log(res);
        })
        .catch(err => console.log(err))
}