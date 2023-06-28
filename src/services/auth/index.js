import axios from "axios";
const URL = process.env.REACT_APP_SERVER;
const END_POINTS = {
  google_signIn: '/api/Auth'
}
// import React from 'react';
// import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// export const loginWithGoogle = () => {
//   return (
//       <GoogleOAuthProvider clientId="319062689013-fku6m54vf3arbhrnoiij84qb0e852o28.apps.googleusercontent.com">
//         <GoogleLogin
//           onSuccess={credentialResponse => {
//             console.log(credentialResponse.credential);
//           }}
//           onError={() => {
//             console.log('Login Failed');
//           }}
//         />
//       </GoogleOAuthProvider>
//   );
// };

export const loginWithGoogle = async (tokenId) => {
  return await axios.post(`${URL}${END_POINTS.google_signIn}`,
    tokenId,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6IjMiLCJSb2xlIjoiQURNSU4iLCJleHAiOjE2OTAyNzUzMTgsImlzcyI6IkZCdXNfU1dQIiwiYXVkIjoiRkJ1c19TV1AifQ.UQGNjS5BPJfY63oh8JfaTcC-CxoiWfzaFdtSPHjwe9A'}`,
      }
    })
}
