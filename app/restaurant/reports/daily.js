import React from 'react';
import {connect} from 'react-redux';
import moment from 'moment';

import {execute} from '../network';
import {USER_ACTIONS} from '../constants';

const GRID_COLUMNS = [
    {key: 'date', name: 'Date'},
    {key: 'sale', name: 'Total Sale'},
    {key: 'purchase', name: 'Total Purchase'},
    {key: 'profit', name: 'Profit'}
];

class DailySalePurchase extends React.Component {

    constructor(props) {
        super(props);
        let currDate = moment();
        let toDate = currDate.format('YYYY-MM-DD');
        let fromDate = currDate.add('days', -7).format('YYYY-MM-DD');
        this.state = {fromDate : fromDate, toDate : toDate};
        this.handleChange = this.handleChange.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
    }

    handleChange(e) {
        e.preventDefault();
        let currState = this.state;
        currState[e.target.name] = e.target.value;
        this.setState(currState);
    }

    handleSearch() {
        let criteria = {
            fromDate: this.state.fromDate && this.state.fromDate.length ? this.state.fromDate : null,
            toDate: this.state.toDate && this.state.toDate.length ? this.state.toDate : null
        }
        this.props.fetchDailySalePurchase(criteria);
    }

    render() {
        let component = (<div><h3> 'Loading Daily Report ....' </h3></div>);
        if(!this.props.fetching) {
            component = (<ReactDataGrid
                             columns={GRID_COLUMNS}
                             rowGetter={this.getRowAt}
                             rowCount={this.props.dailySalePurchase.length}
                         />);
        }
        return (<div>
                    <Form horizontal><FormGroup>
                        <Col sm={3}><FormControl type="date" value={this.state.fromDate} name='fromDate' placeholder="From Date" onChange={this.handleChange}/></Col>
                        <Col sm={3}><FormControl type="date" value={this.state.toDate} name='toDate' placeholder="To Date" onChange={this.handleChange}/></Col>
                        <Col sm={2}><Button bsStyle="primary" onClick={this.handleSearch}>Fetch Report</Button></Col>
                    </FormGroup></Form>
                    {component}
                </div>);
    }
}

const mapStateToProps = state =>{
    return  {
        fetching : state.dailySalePurchase.fetching,
        dailySalePurchase : state.dailySalePurchase.reports
    }
};
const mapDispatchToProps = dispatch => {
    return {
        fetchDailySalePurchase : (criteria) => dispatch(execute(USER_ACTIONS.FETCH_DAILY_SALE_PURCHASE, null, criteria))
    }
}

export default connect(mapStateToProps, mapDispatchToProps) (DailySalePurchase);