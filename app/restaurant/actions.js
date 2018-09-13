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
        type: REDUX_ACTIONS.FETCH_BILL_BY_ID,
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

export function billModal(bill, open=true) {
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

export function dailySalePurchase(reports, fetching = false) {
    return {type: REDUX_ACTIONS.FETCH_DAILY_SALE_PURCHASE, reports, fetching };
}