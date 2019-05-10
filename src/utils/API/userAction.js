import axios from 'axios';
import CONSTANTS from '../constantes';
// import { constant } from '../constantes';

export const forgetPassword = (body) => {
    return new Promise((resolve, reject) => {
        return axios.post(`${CONSTANTS.URL_API_PRE}/auth/forgot-password`, body, {
            headers: {
                'Accept': 'application/json',
                "Content-Type": "application/json"
            }
        })
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            })
    });
}

export const updatePassword = (user, token) => {
    return new Promise((resolve, reject) => {
        return axios.patch(`${CONSTANTS.URL_API_PRE}/auth/reset-password`, user, {
            headers: {
                Authorization: "Bearer " + token
            }
        })
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            })
    });
}


export const SignIn = (user) => {
    return new Promise((resolve, reject) => {
        return axios.post(`${CONSTANTS.URL_API_PRE}/auth/local`, user, {
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            })
    });
}
export const RegisterUser = (user) => {
    return new Promise((resolve, reject) => {
        return axios.post(`${CONSTANTS.URL_API_PRE}/auth/local/register`, user, {
            headers: {
                "Content-Type": "application/json"
            }
        }).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error);
        })
    })
}

export const updateProfile = (id, token, user) => {
    console.log("=====", id, user, token)
    return new Promise((resolve, reject) => {
        return axios.put(`${CONSTANTS.URL_API_PRE}/users/${id}`, user, {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        })
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            })
    });
}
export const getProfile = (id) => {
    console.log("=====", id)
    return new Promise((resolve, reject) => {
        return axios.get(`${CONSTANTS.URL_API_PRE}/users/${id}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            })
    });
}
