import { 
    SHOW_FLAG,
} from "../constants/action-types";


const initialState = {
    flag: false,
}

export default function progressReducer(state = initialState, action) {
    switch (action.type) {
        case SHOW_FLAG:
            return {...state, flag: action.payload }
        default:
            return state
    }
}