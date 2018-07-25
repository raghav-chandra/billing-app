import {combinedReducers} from 'redux';
import {REDUX_ACTIONS} from './constants';

const itemsInitState= {fetching:true,items:[]};
const configsInitState= {fetching:true,configs:[]};
const billInitState= {fetching:true,bill:{}};

function retrieveItems (state=itemsInitState, action) {
    switch(action.type) {
        case REDUX_ACTIONS.FETCH_ALL_ITEMS:
            return Object.assign({},state,{fetching:action.fetching,items:action.items});
        default:
            return state;
    }
}

function retrieveBillById (state=billInitState, action) {
    switch(action.type) {
        case REDUX_ACTIONS.FETCH_BILL_BY_ID:
            return Object.assign({},state,{fetching:action.fetching,bill:action.bill});
        default:
            return state;
    }
}

function retrieveConfigs (state=configsInitState, action) {
    switch(action.type) {
        case REDUX_ACTIONS.FETCH_ALL_CONFIGS:
            return Object.assign({},state,{fetching:action.fetching,configs:action.configs});
        default:
            return state;
    }
}

export default combinedReducers({retrieveItems,retrieveConfigs,retrieveBillById});