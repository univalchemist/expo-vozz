import axios from 'axios';
import CONSTANTS from '../constantes';

export const updatePlay = (id, token, play) => {
    console.log("--->updatePlay:", id, play, token)
    return new Promise((resolve, reject) => {
        return axios.put(`${CONSTANTS.URL_API_PRE}/plays/${id}`, play, {
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
export const createPlay = (token, play) => {
    return new Promise((resolve, reject) => {
        return axios.post(`${CONSTANTS.URL_API_PRE}/plays`, play, {
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