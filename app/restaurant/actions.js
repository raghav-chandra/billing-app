import {REDUX_ACTIONS} from './constants';

export function retrieveItems (items, fetching=true) {
    return {
        type: REDUX_ACTIONS.FETCH_ALL_ITEMS,
        items,
        fetching
    }
}