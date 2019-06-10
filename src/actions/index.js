import {
    AsyncStorage,
} from 'react-native';
import {
    SHOW_RECORDER,
    SHOW_HASHTAGS,
    SAVE_AUTHDATA,
    RECEIVE_LAST_MOMENTS,
    SHOW_PLAYER,
    MOMENTS_NEED_REFRESH,
    TAB_INDEX,
    UPDATE_USERDATA,
    SHOW_FLAG,
    CHAT_LIST,
    PUSH_TOKEN,
    CHAT_SCREEN
} from "../constants/action-types"
import constantes from '../utils/constantes';
import { FileSystem } from "expo";
import CONSTANTS from "../utils/constantes";
import { updateMoment } from "../utils/API/moment";
import { TAG_QUERY } from "../utils/Apollo/Queries/tag";
import { updateProfile, getProfile } from "../utils/API/userAction";
import { LAST_MOMENT_QUERY } from '../utils/Apollo/Queries/moment';
import { sendNotification } from '../utils/API/notification';

export function uploadRecording(payload) {
    return dispatch => {
        dispatch(updateProgressFlag(true));
        fetch(CONSTANTS.URL_API_PRE + "/moments", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + payload.auth.jwt,
                "Content-Type": 'application/json',
                "Accept": 'application/json'
            },
            body: JSON.stringify({
                ultimas: true,
                user: payload.auth.user._id,
                title: payload.title
            })
        }).then(resp => {
            console.log({ respMoment: resp })
            if (resp.ok) {
                resp.json().then(momento => {
                    Expo.FileSystem.getInfoAsync(payload.file).then(file => {
                        const body = new FormData();
                        //const ext = payload.file.split(".").slice(-1)[0]
                        body.append('files', {
                            uri: payload.file,
                            name: payload.file.split("/").slice(-1)[0],
                            type: 'multipart/form-data'
                        });
                        body.append("refId", momento._id);
                        body.append("ref", "moment");
                        body.append("field", "audio");
                        body.append("path", "record");
                        console.log('start uploading audio>>>');
                        fetch(CONSTANTS.URL_API_PRE + "/upload", {
                            method: "POST",
                            headers: {
                                "Authorization": "Bearer " + payload.auth.jwt,
                                "Content-Type": 'multipart/form-data',
                                "Accept": 'multipart/form-data',
                            },
                            body
                        }).then(resp => {
                            resp.json().then(file => {
                                console.log('end uploading audio>>>');
                                dispatch(momentsNeedRefresh(true))
                                dispatch(saveHashtags(payload, momento._id))
                            }).catch(err => {
                                dispatch(updateProgressFlag(false));
                                console.log("uploading file error1", err)
                            })
                        }).catch(err => {
                            dispatch(updateProgressFlag(false));
                            console.log("uploading file error2", err)
                        })
                    }).catch(err => {
                        dispatch(updateProgressFlag(false));
                        console.log("get file info expo error", err)
                    })
                }).catch(err => {
                    dispatch(updateProgressFlag(false));
                    console.log("json parse error", err)
                })
            }
        }).catch(err => {
            dispatch(updateProgressFlag(true));
            console.log("post moments error", err)
        })
    }
}

export function showRecorder(payload) {
    return { type: SHOW_RECORDER, payload }
}

export function showHashtags(payload) {
    return { type: SHOW_HASHTAGS, payload }
}

export function saveHashtags(payload, moment_id) {
    console.log({ moment_id })
    const headers = {
        "Authorization": "Bearer " + payload.auth.jwt,
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    return async dispatch => {
        const hashtagsProm = payload.hashtags.map(async name => {
            try {
                console.log('start get tag query!')
                const res = await payload.client.query({ query: TAG_QUERY, fetchPolicy: 'network-only', variables: { name: name } });
                console.log({ resTagQuery: res })
                let _tag = res.data.tags;
                if (_tag.length != 0) { return _tag }
                else {
                    const tag = await (await fetch(CONSTANTS.URL_API_PRE + "/tags", {
                        method: "POST",
                        headers,
                        body: JSON.stringify({ name })
                    })).json()
                    console.log({ tag })
                    return tag;
                }
            } catch (error) {
                dispatch(updateProgressFlag(false));
                console.log(error)
            }
        })
        console.log('end get tag query!')
        const hashtags = await Promise.all(hashtagsProm);
        const tags = hashtags.map(h => h._id)
        updateMoment(moment_id, payload.auth.jwt, { tags: tags })
            .then((response) => {
                dispatch(updateProgressFlag(false));
                dispatch(momentsNeedRefresh(true))
                dispatch(fetchLastMoments({ apolloClient: payload.client, user: payload.auth.user }))
                dispatch(showHashtags({ show: false }))
            })
            .catch((error) => {
                console.log({ updateMoment_error: error });
                dispatch(updateProgressFlag(false));
            })
    }
}

export function saveAuthdata(payload) {
    return { type: SAVE_AUTHDATA, payload }
}
export function updateUserdata(payload) {
    return { type: UPDATE_USERDATA, payload }
}
export function updateTabIndex(tabIndex) {
    return { type: TAB_INDEX, payload: tabIndex }
}
export function updateProgressFlag(flag) {
    return { type: SHOW_FLAG, payload: flag }
}
export function fetchLastMoments(payload) {
    return async dispatch => {
        try {
            let res = await payload.apolloClient.query({ query: LAST_MOMENT_QUERY, fetchPolicy: 'network-only', variables: { id: payload.user._id } });
            let lasts = res.data.moments;
            dispatch(receiveLastMoments(lasts))
            dispatch(momentsNeedRefresh(false))
        } catch (e) {
            console.log({ errorR: e })
        }
    }
}
export function receiveLastMoments(payload) {
    return { type: RECEIVE_LAST_MOMENTS, payload }
}

export function showPlayer(payload) {
    //console.log({ showPlayer: payload })
    return { type: SHOW_PLAYER, payload }
}

export function requestPlayer(payload) {
    const getFile = (fileName, dispatch) => {
        fetch(constantes("URL_API") + "/upload/files?name=" + fileName, {
            headers: {
                "Authorization": "Bearer " + payload.auth.jwt,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        }).then(resp => {
            resp.json().then(dataFile => {
                if (dataFile.statusCode === undefined || dataFile.statusCode < 400 || dataFile[0] !== undefined) {
                    FileSystem.downloadAsync(constantes("URL_API") + "/uploads/" + dataFile[0].hash + dataFile[0].ext, FileSystem.cacheDirectory + "Audio/" + dataFile[0].name).then(file => {
                        dispatch(showPlayer({ show: true, audio: file.uri }))
                    }).catch(err => { console.log({ download: err }) })
                }
                else { console.log({ codigoChungo: dataFile }) }
            }).catch(err => { console.log({ parseJSON: err }) })
        }).catch(err => { console.log({ response: err }) })
    }
    return dispatch => {
        FileSystem.readDirectoryAsync(FileSystem.cacheDirectory + "Audio").then(cacheDirectoryFiles => {
            if (cacheDirectoryFiles.includes(payload.audio.audio.name)) {
                const audio = FileSystem.cacheDirectory + "Audio/" + payload.audio.audio.name
                dispatch(showPlayer({ show: true, audio }))
            }
            else { getFile(payload.audio.audio.name, dispatch) }
        }).catch(err => {
            //Si sale por aquí es que no existe la carpeta Audio de Expo, como en una instalación nueva o si se ha borrado la caché
            Expo.FileSystem.makeDirectoryAsync(FileSystem.cacheDirectory + "Audio").then(() => {
                getFile(payload.audio.audio.name, dispatch)
            }).catch(err => console.log("No se puede crear directorio. " + JSON.stringify(err)))
        })
    }
}

export function momentsNeedRefresh(payload) {
    return { type: MOMENTS_NEED_REFRESH, payload }
}
export function updateProfileStore(id) {
    return dispatch => {
        getProfile(id)
            .then((response) => {
                let data = response.data;
                dispatch(updateUserdata(data));
                console.log({ user: data });
                AsyncStorage.setItem('user', JSON.stringify(data));
            })
            .catch((error) => {
                let errorResponse = error.response.data;
                console.log('getProfile error', JSON.stringify(errorResponse));
            })
    }


}

export function savePushToken(payload) {
    return { type: PUSH_TOKEN, payload }
}
export function registerPushToken(id, token, pushToken) {
    return dispatch => {
        updateProfile(id, token, { pushToken: pushToken })
            .then((response) => {
                console.log('registerPushToken response', JSON.stringify(response));
                dispatch(updateUserdata(response.data));
                AsyncStorage.setItem('user', JSON.stringify(response.data));
            })
            .catch((error) => {
                let errorResponse = error.response.data;
                console.log('registerPushToken error', JSON.stringify(errorResponse));
            })
    }
}

export function fetchChatList(payload) {
    return { type: CHAT_LIST, payload }
}
export function updateChatScreenState(payload) {
    return { type: CHAT_SCREEN, payload }
}
export const sendNotificationToUser = (pushToken, userName, message) => {
    return dispatch => {
        sendNotification(pushToken, userName, message)
            .then((response) => {
                console.log('sendNotificationResponse', response.data.data)
            })
            .catch((error) => {
                console.log('sendNotificationError', error)
            })
    }
}