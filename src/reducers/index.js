import { combineReducers } from 'redux'
import recorder from './recorder'
import auth from './auth'
import moments from './moments'
import player from './player'
import tabIndex from './tabIndex'
import progress from './progress'

const rootReducer = combineReducers({
    recorder, 
    auth,
    moments,
    player,
    tabIndex,
    progress
})

export default rootReducer;