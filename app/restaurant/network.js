import {USER_ACTIONS} from './constants';
import {retrieveItems, fetchById, fetchConfigs, billModal, searchBill, fetchLogin} from './actions';
 
const HTTP_GET = 'GET'; 
const HTTP_POST = 'POST';
 
const CALL_MAPPER = {
    [USER_ACTIONS.FETCH_ALL_ITEMS]: (dispatch, action, param, data) => executeGetRequest(dispatch, 'billing/items/getAll', retrieveItems),
    [USER_ACTIONS.FETCH_ALL_CONFIGS]: (dispatch, action, param, data) => executeGetRequest(dispatch, 'billing/configs/getAll', fetchConfigs),
    [USER_ACTIONS.CREATE_BILL]: (dispatch, action, param, data) => executePostRequest(dispatch, 'billing/bills/create', data, billModal),
    [USER_ACTIONS.FETCH_BILL_BY_ID]: (dispatch, action, billId, data) => executeGetRequest(dispatch, 'billing/bill/' + billId, fetchById),
    [USER_ACTIONS.SEARCH_BILL]: (dispatch, action, billId, data) => executePostRequest(dispatch, 'billing/bills/search', data, searchBill),
    [USER_ACTIONS.CREATE_LOGIN]: (dispatch, action, billId, data) => executePostRequest(dispatch, 'billing/login/create', data, (lo) => {
        return fetchLogin({});
    }),
    [USER_ACTIONS.FETCH_LOGIN]: (dispatch, action, billId, data) => executePostRequest(dispatch, 'billing/login', data, (details) => {
            let ld = {};
            if (details && details.UserP) {
                let d = new Date();
                d.setTime(d.getTime() + (24 * 60 * 60 * 1000));
                let expiry = 'expires=' + d.toUTCString();
                document.cookie = 'LT=' + details.UserP + ';' + expiry + ';path=/';
                ld = details;
            }

            return fetchLogin(ld);
    }),
};

export function execute(action, param, data = null) {
    return function (dispatch) {
        try {
            return CALL_MAPPER[action](dispatch, action, param, data);
        } catch (e) {
            alert ('Failed while ' + action + '. Please retry' +  e);
        }
    }
}

function executePostRequest (dispatch, url, data, successAction) {
    executeRequest(dispatch,url,successAction,HTTP_POST, data);
}

function executeGetRequest (dispatch, url, successAction) {
    executeRequest(dispatch,url,successAction, HTTP_GET);
}

function executeRequest (dispatch, url, successAction, requestType, data = null) {
    const createPromise = (requestType) =>{
        if(requestType === HTTP_GET) {
            fetch(url, {credentials: 'include'})
        } else {
            let req = new Request(url, {
                method:'POST',
                credentials:'include',
                headers: {'Content-Type' : 'application/json'},
                body: data !=null && typeof data === 'object' ? JSON.stringify(data) :data
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
            return dispatch(successAction(json.data));
        } else {
            throw json.message;
        }
    }).catch(function(error) {
        alert('Failed : ' + (error.message? error.message:error));
    })
}
