import axios from 'axios';
import CONSTANTS from '../constantes';
// import { constant } from '../constantes';

export const createRoute = (token, route) => {
    return new Promise((resolve, reject) => {
        return axios.post(`${CONSTANTS.URL_API_PRE}/routes`, route, {
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        }).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error);
        })
    })
}

export const uploadRouteImage = (token, body) => {
    console.log('uploadRouteImage----', token)
    return new Promise((resolve, reject) => {
        return axios.post(`${CONSTANTS.URL_API_PRE}/upload`, body, {
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": 'multipart/form-data',
                "Accept": 'multipart/form-data',
            }
        }).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error);
        })
    })
}
export const getRoute = (id) => {
    return new Promise((resolve, reject) => {
        return axios.get(`${CONSTANTS.URL_API_PRE}/routes/${id}`, {
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
export const deleteRoute = (token, id) => {
    return new Promise((resolve, reject) => {
        return axios.delete(`${CONSTANTS.URL_API_PRE}/routes/${id}`, {
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        }).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error);
        })
    })
}