
import {USER_ACTIONS} from './constants'

const HTTP_GET ='GET';
const HTTP_POST ='POST';

const CALL_MAPPER= {
    USER_ACTIONS.CREATE_BILL : createBill
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
    return executePostRequest(dispatch, action, param, data, HTTP_POST);
}

function executePostRequest () {
}

function executeGetRequest () {
}

function executeRequest () {
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
            response.json();
        }
    }).then (json=>{
        if(json.success) {
            //Successfull
        } else {
            throw json.message;
        }
    }).catch(function(error) {
        alert('Failed : ' + (error.message? error.message:error));
    })
}
