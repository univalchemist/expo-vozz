import { 
    RECEIVE_LAST_MOMENTS, MOMENTS_NEED_REFRESH
} from "../constants/action-types";


const initialState = {
    last: []
}

export default function momentReducer(state = initialState, action) {
    //console.log( action )
    switch (action.type) {
        case RECEIVE_LAST_MOMENTS:
            return {...state, last: action.payload }
        case MOMENTS_NEED_REFRESH:
            return { ...state, needRefresh: action.payload }
        default:
            return state
    }
}