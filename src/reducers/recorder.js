import { 
    SHOW_RECORDER,
    SHOW_HASHTAGS,
    UPLOAD_RECORDING
} from "../constants/action-types";


const initialState = {
    showRecorder: false,
    showHashtags: false
}

export default function recorderReducer(state = initialState, action) {
    //console.log( action )
    switch (action.type) {
        case SHOW_RECORDER:
            return {...state, showRecorder: action.payload }
        case SHOW_HASHTAGS:
            return {...state, hashtags: action.payload }
        case UPLOAD_RECORDING:
            return state;
        default:
            return state
    }
}