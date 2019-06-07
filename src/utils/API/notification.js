import axios from 'axios';

export const sendNotification = (pushToken, userName, message) => {
    console.log('=======================================');
    console.log(pushToken, userName, message)
    return new Promise((resolve, reject) => {
        return axios.post(`https://exp.host/--/api/v2/push/send`,
            {
                "to": pushToken,
                "title": userName,
                "body": message,
                "data": {
                    'title': userName,
                    'body': message
                }
            },
            {
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