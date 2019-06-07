import {
    PUSH_TOKEN
} from "../constants/action-types";

const initialState = {}

export default function notificationReducer(state = initialState, action) {
    switch (action.type) {
        case PUSH_TOKEN:
            return { ...state, pushToken: action.payload }
        default:
            return state
    }
}