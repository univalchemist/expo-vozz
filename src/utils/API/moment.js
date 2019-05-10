import axios from 'axios';
import CONSTANTS from '../constantes';

export const updateMoment = (id, token, moment) => {
    console.log("--->Moment:", id, moment, token)
    return new Promise((resolve, reject) => {
        return axios.put(`${CONSTANTS.URL_API_PRE}/moments/${id}`, moment, {
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
export const deleteMoment = (id, token) => {
    return new Promise((resolve, reject) => {
        return axios.delete(`${CONSTANTS.URL_API_PRE}/moments/${id}`, {
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