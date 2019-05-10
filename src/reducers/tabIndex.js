import { 
    TAB_INDEX
} from "../constants/action-types";

const initialState = { index: 0 }

export default function tabReducer(state = initialState, action) {
    
    switch (action.type) {
        case TAB_INDEX:
        return {...state, index: action.payload }
        default:
            return state
    }
}