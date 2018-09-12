import React from 'react';
import {connect} from 'react-redux';
import ReactDataGrid from 'react-data-grid';
import {Button, FormGroup, ControlLabel, FormControl, Form, Col, Row} from 'react-bootstrap';
import {execute} from "../network";
import {USER_ACTIONS} from "../constants";
import {searchBill} from "../actions";
const GRID_COLUMNS = [
    {key: 'billId', name: 'Invoice No'},
    {key: 'mobile', name: 'Mobile'},
    {key: 'name', name: 'Name', resizable: true},
    {key: 'billDate', name: 'Date', resizable: true},
    {key: 'finalAmount', name: 'Amount', resizable: true},
    {key: 'sellPurchase', name: 'Type', resizable: true}
];

export class BillSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {fromDate: null, toDate: null, mobile: null, billId: null};
        this.handleChange = this.handleChange.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.getRowAt = this.getRowAt.bind(this);
    }

    handleChange(e) {
        e.preventDefault();
        let currState = this.state;
        currState[e.target.name] = e.target.value;
        this.setState(currState);
    }

    handleSearch() {
        let criteria = {
            mobile: this.state.mobile,
            billId: this.state.billId && this.state.billId.length ? Number(this.state.billId) : null,
            fromDate: this.state.fromDate && this.state.fromDate.length ? this.state.fromDate : null,
            toDate: this.state.toDate && this.state.toDate.length ? this.state.toDate : null
        }
        this.props.searchBills(criteria);
    }
    
    getRowAt(index) {
        if (index < 0 || index > this.props.bills.length) {
            return undefined;
        }
        return this.props.bills[index];
    }
 
    render() {
        let grid = 'Loading';
    
        return (<div><Form horizontal>
                <FormGroup>
                    <Col sm={2}><FormControl type="text" value={this.state.billId} name='billId' placeholder="Invoice" onChange={this.handleChange}/></Col>
                    <Col sm={2}><FormControl type="text" value={this.state.mobile} name='mobile' placeholder="Mobile" onChange={this.handleChange}/></Col>
                    <Col sm={3}><FormControl type="date" value={this.state.fromDate} name='fromDate' placeholder="From Date" onChange={this.handleChange}/></Col>
                    <Col sm={3}><FormControl type="date" value={this.state.toDate} name='toDate' placeholder="To Date" onChange={this.handleChange}/></Col>
                    <Col sm={2}><Button bsStyle="primary" onClick={this.handleSearch}>Search Bill</Button></Col>
                </FormGroup></Form> 
                
                <ReactDataGrid columns={GRID_COLUMNS}
                                rowGetter={this.getRowAt}
                                rowsCount={this.props.bills.length}
                                minHeight={500}
                                />
                </div>);
    }
} 

const mapStateToProps = (state) => {
    return {
        bills: state.searchBill.bills,
        fetching: state.searchBill.fetching
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        searchBills: (criteria) => {
                dispatch(searchBill([], true));
                dispatch(execute(USER_ACTIONS.SEARCH_BILL, null, criteria));
            }
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(BillSearch);

