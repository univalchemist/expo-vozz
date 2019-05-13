import axios from 'axios';
import CONSTANTS from '../constantes';

export const createComment = (token, comment) => {
    return new Promise((resolve, reject) => {
        return axios.post(`${CONSTANTS.URL_API_PRE}/comments`, comment, {
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