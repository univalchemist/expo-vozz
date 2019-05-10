import { createStore, applyMiddleware, compose } from 'redux'
import rootReducer from '../reducers/index'
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import logger from 'redux-logger'

const middlewareEnhancer = applyMiddleware(thunk)

const enhancers = [middlewareEnhancer]
const composedEnhancers = composeWithDevTools(...enhancers)
const store = createStore(
    rootReducer,
    {},
    compose(
        composedEnhancers
    )
)

export default store