import axios from 'axios';
import CONSTANTS from '../constantes';
// import { constant } from '../constantes';

export const createExperience = (token, experience) => {
    return new Promise((resolve, reject) => {
        return axios.post(`${CONSTANTS.URL_API_PRE}/experiences`, experience, {
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

export const uploadExperienceImage = (token, body) => {
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
export const getExperience = (id) => {
    return new Promise((resolve, reject) => {
        return axios.get(`${CONSTANTS.URL_API_PRE}/experiences/${id}`, {
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
export const deleteExperience = (token, id) => {
    return new Promise((resolve, reject) => {
        return axios.delete(`${CONSTANTS.URL_API_PRE}/experiences/${id}`, {
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