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