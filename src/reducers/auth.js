import {
    SAVE_AUTHDATA,
    UPDATE_USERDATA
} from "../constants/action-types";

const initialState = {}

export default function authReducer(state = initialState, action) {
    switch (action.type) {
        case SAVE_AUTHDATA:
            return { ...action.payload }
        case UPDATE_USERDATA:
            return {...state, user: action.payload }
        default:
            return state
    }
}