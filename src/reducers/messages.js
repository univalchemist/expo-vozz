import { 
    RECEIVE_LAST_MESSAGE, MESSAGES_NEED_REFRESH
} from "../constants/action-types";


const initialState = {
    last: {}
}

export default function messageReducer(state = initialState, action) {
    //console.log( action )
    switch (action.type) {
        case RECEIVE_LAST_MESSAGE:
            return {...state, last: action.payload }
        case MESSAGES_NEED_REFRESH:
            return { ...state, needRefresh: action.payload }
        default:
            return state
    }
}