import {
    CHAT_LIST, CHAT_LIST_NEED_REFRESH, CHAT_SCREEN
} from "../constants/action-types";


const initialState = {
    chatScreen: false,
    chatListKeys: null,
    totalUnRead: 0
}

export default function messageReducer(state = initialState, action) {
    //console.log( action )
    switch (action.type) {
        case CHAT_LIST:
            return { ...state, chatListKeys: action.payload.chatListKeys, totalUnRead: action.payload.totalUnRead }
        case CHAT_LIST_NEED_REFRESH:
            return { ...state, needRefresh: action.payload }
        case CHAT_SCREEN:
            return { ...state, chatScreen: action.payload }
        default:
            return state
    }
}