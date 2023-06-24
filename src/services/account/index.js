import axios from "axios";
const URL = process.env.REACT_APP_SERVER;
const END_POINTS = {
    getMultiAccounts: '/api/Accounts',
    getSingleAccount: '/api/Accounts',
}


export const getMultiAccounts = async (data) => {
    return await axios.get(`${URL}/${END_POINTS.getMultiAccounts}`, {
        params: {
            Code : data.code,
            Email : data.email,
            PageIndex: code.pageIndex,
            PageSize: data.pagesize,
            OrderBy: data.OrderBy,
            Direction: data.direction
        }
    })
}


export const getSingleAccount = async (id) => {
    return await axios.get(`${URL}/${END_POINTS.getSingleAccount}/${id}`)
}