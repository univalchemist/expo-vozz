import { 
    CHAT_LIST, CHAT_LIST_NEED_REFRESH
} from "../constants/action-types";


const initialState = {
    chatList: null,
    chatListKeys: null
}

export default function messageReducer(state = initialState, action) {
    //console.log( action )
    switch (action.type) {
        case CHAT_LIST:
            return {...state, chatList: action.payload.chatList, chatListKeys: action.payload.chatListKeys }
        case CHAT_LIST_NEED_REFRESH:
            return { ...state, needRefresh: action.payload }
        default:
            return state
    }
}