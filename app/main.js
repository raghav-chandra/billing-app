import React from 'react';
import ReactDOM from 'react-dom';
import {createStore,applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import thunkMiddleware from 'react-thunk';
import createLogger from 'react-logger';

import {Restaurant} from './restaurant/main'

export const store = createStore(restaurantReducer, applyMiddleware(thunkMiddleware,createLogger()));

class App extends React.Component{
    constructor(props) {
        super(props);
    }

    render() {
        return (<Provider store={store}>
            <Restaurant />
        </Provider>)
    }
}


ReactDOM.render(<App />,document.getElementById('billing-content'));
