import axios from 'axios';
import CONSTANTS from '../constantes';


export const getCategories = () => {
    return new Promise((resolve, reject) => {
        return axios.get(`${CONSTANTS.URL_API_PRE}/categories`,{
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
