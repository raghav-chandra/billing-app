import {combineReducers} from 'redux';
import {REDUX_ACTIONS} from './constants';

const itemsInitState = {fetching:true,items:[]};
const configsInitState = {fetching:true,configs:[]};
const billInitState = {fetching:true,bill:{}};

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

function billModal(state = {bills: null, fetching: true}, action) {
    switch (action.type) {
        case REDUX_ACTIONS.BILL_MODAL:
            return Object.assign({}, state, {open: action.open, bill: action.bill});
        default:
            return state;
    }
}

function searchBill(state = billSearchInitialState, action) {
    switch (action.type) {
        case REDUX_ACTIONS.SEARCH_BILL:
            return Object.assign({}, state, {fetching: action.fetching, bills: action.bills});
        default:
            return state;
    }
}


function fetchLogin(state = loginInitialState, action) {
    switch (action.type) {
        case REDUX_ACTIONS.FETCH_LOGIN:
            return Object.assign({}, state, {fetching: action.fetching, login: action.login});
        default:
            return state;
    }
}

export default combineReducers({retrieveItems,retrieveConfigs,retrieveBillById,billModal,searchBill,fetchLogin});
