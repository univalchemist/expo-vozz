import axios from 'axios';
import CONSTANTS from '../constantes';

export const updateLike = (id, token, like) => {
    return new Promise((resolve, reject) => {
        return axios.put(`${CONSTANTS.URL_API_PRE}/likes/${id}`, like, {
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
export const deleteLike = (id, token) => {
    return new Promise((resolve, reject) => {
        return axios.delete(`${CONSTANTS.URL_API_PRE}/likes/${id}`, {
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
export const createLike = (token, like) => {
    return new Promise((resolve, reject) => {
        return axios.post(`${CONSTANTS.URL_API_PRE}/likes`, like, {
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