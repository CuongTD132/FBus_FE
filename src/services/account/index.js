import axios from "axios";
const URL = process.env.REACT_APP_SERVER;
const END_POINTS = {
    getMultiAccounts: 'api/Accounts',
    getSingleAccount: 'api/Accounts',
}


export const getMultiAccounts = async (data) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        return await axios.get(`${URL}/${END_POINTS.getMultiAccounts}`, {
            params: {
                ...data
            },
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
            },
        })
    }
}

export const getAllAccounts = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        return await axios.get(`${URL}/${END_POINTS.getMultiAccounts}`, {
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
            },
        })
    }
}

export const getSingleAccount = async (id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        return await axios.get(`${URL}/${END_POINTS.getSingleAccount}/${id}`,{
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
            },
        })
        
    }
}