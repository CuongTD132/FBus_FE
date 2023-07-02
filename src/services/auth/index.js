import axios from "axios";
const URL = process.env.REACT_APP_SERVER;
const END_POINTS = {
  google_signIn: '/api/Auth'
}

export const loginWithGoogle = async (idToken) => {
  return await axios.post(`${URL}${END_POINTS.google_signIn}`,
    idToken,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      }
    })
}
