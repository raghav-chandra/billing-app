import {REDUX_ACTIONS} from './constants';

export function retrieveItems (items, fetching=false) {
    return {
        type: REDUX_ACTIONS.FETCH_ALL_ITEMS,
        items,
        fetching
    }
}

export function fetchConfigs (configs, fetching=false) {
     return {
         type: REDUX_ACTIONS.FETCH_ALL_CONFIGS,
         configs,
         fetching
     }
}

export function fetchById(bill, fetching=false) {
    return {
        type: REDUX_ACTIONS.FETCH_ALL_CONFIGS,
        bill,
        fetching
    }
}

export function searchBill(bills, fetching=false) {
    return {
        type: REDUX_ACTIONS.SEARCH_BILLS,
        bills,
        fetching
    }
}

export function billModal(bill, open=false) {
    return {
        type: REDUX_ACTIONS.BILL_MODAL,
        bill,
        open
    }
}

export function fetchLogin(login, fetching=false) {
    return {
        type: REDUX_ACTIONS.FETCH_LOGIN,
        login,
        fetching
    }
}