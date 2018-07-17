

import {USER_ACTIONS} from './constants';
import {retrieveItems} from './action';

const HTTP_GET ='GET';
const HTTP_POST ='POST';

const CALL_MAPPER= {
    USER_ACTIONS.CREATE_BILL : createBill,
    USER_ACTIONS.FETCH_ALL_ITEMS: fetchAllItems
}

export function execute(action, param, data = null) {
    return function (dispatch) {
        try {
            return CALL_MAPPER[action](dispatch, action, param, data);
        } catch (e) {
            alert ('Failed while ' + action + '. Please retry');
        }
    }
}

function createBill(dispatch, action, param, data) {
    return executePostRequest(dispatch, 'billing/bills/create', data);
}

function createBill(dispatch, action, param, data) {
    return executeGetRequest(dispatch, 'billing/items/getALl');
}

function executePostRequest (dispatch, url, data, successAction) {
    executeRequest(dispatch,url,successAction,HTTP_POST, data);
}

function executeGetRequest (dispatch, url, successAction) {
    executeRequest(dispatch,url,retrieveItems, HTTP_GET);
}

function executeRequest (dispatch, url, requestType,successAction, data) {
    const createPromise = (requestType) =>{
        if(requestType === HTTP_GET) {
            fetch(url, {credentials: 'include'})
        } else {
            let req = new Request(url, {
                method:'POST',
                credentials:'include',
                headers: {'Content-Type' : 'application/json'}
                body: data !=null && typeof data === 'object' ? JSON.stringify(data) :data;
             });
             return fetch(req);
        }
    }

    return createPromise(requestType).then(response=>{
        if(!response.ok) {
            throw response.statusText;
        } else {
            return response.json();
        }
    }).then (json=>{
        if(json.success) {
            return dispatch successAction(json.data);
        } else {
            throw json.message;
        }
    }).catch(function(error) {
        alert('Failed : ' + (error.message? error.message:error));
    })
}
