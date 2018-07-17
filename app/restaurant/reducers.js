import {combinedReducers} from 'redux';
import {REDUX_ACTIONS} from './constants';

const itemsInitState= {fetching:true,items:[]};

function retrieveItems (state=itemsInitState, action) {
    switch(action.type) {
        case REDUX_ACTIONS.FETCH_ALL_ITEMS:
            return Object.assign({},state,{fetching:action.fetching,items:action.items});
        default:
            return state;
    }
}

export default combinedReducers({retrieveItems});