import React from 'react';
import ReactDOM from 'react-dom';
import {createStore,applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import {createLogger} from 'redux-logger';

import restaurantReducer from "./restaurant/reducers";
import {USER_ACTIONS} from './restaurant/constants';
import {execute} from './restaurant/network';
import {Restaurant} from './restaurant/main';

export const store = createStore(restaurantReducer, applyMiddleware(thunkMiddleware,createLogger()));

store.dispatch(execute(USER_ACTIONS.FETCH_ALL_ITEMS,null));
store.dispatch(execute(USER_ACTIONS.FETCH_LOGIN,null));

ReactDOM.render(<Provider store={store}><Restaurant /></Provider>,document.getElementById('billing-content'));
