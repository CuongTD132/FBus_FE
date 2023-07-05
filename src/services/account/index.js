import axios from "axios";
const URL = process.env.REACT_APP_SERVER;
const END_POINTS = {
    getMultiAccounts: 'api/Accounts',
    getSingleAccount: 'api/Accounts',
}


export const getMultiAccounts = async (data) => {
    return await axios.get(`${URL}/${END_POINTS.getMultiAccounts}`, {
        params: {
            ...data
        },
    })
}

export const getAllAccounts = async () => {
    return await axios.get(`${URL}/${END_POINTS.getMultiAccounts}`, {
        
    })
}

export const getSingleAccount = async (id) => {
    return await axios.get(`${URL}/${END_POINTS.getSingleAccount}/${id}`)
}