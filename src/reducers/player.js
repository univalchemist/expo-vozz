import { 
    SHOW_PLAYER,
} from "../constants/action-types";


const initialState = {
    show: false,
    audio: {}
}

export default function playerReducer(state = initialState, action) {
    //console.log( action )
    switch (action.type) {
        case SHOW_PLAYER:
            return {...state, show: action.payload.show, audio: action.payload.audio }
        default:
            return state
    }
}