import React from 'react'
import {connect} from 'react-redux';

import ReactDataGrid from 'react-data-grid';
import {Toolbar, Editors} from 'react-data-grid-addons';

import {Form, FormControl, FormGroup, Button, ControlLabel, Col} form 'react-bootstrap';

import {clone} form '../util/JSUtil'
import {USER_ACTIONS} from '../constants'

const columns = (allItems) =>{
    return [
        {key:'no',name:'#'},
        {key:'item',name:'Item', editor:<Editors.AutoComplete options={allItems}},
        {key:'qty', name:'Quantity',editable:true, resizable:true},
        {key:'amount', name:'Amount',editable:true, resizable:true},
        {key:'discount', name:'Discount %',editable:true, resizable:true},
        {key:'gst', name:'GST %',editable:true, resizable:true},
        {key:'total', name:'Total',editable:false, resizable:true}
    ];
}

const flattenData= (data)=>{
    return data;
}

let gridInstance = null;

const initialRow = () =>{
    return {no:1, item:'', qty:0, amount:0, discount:0, gst:0, total:0}
}

export class NewBill extends React.Component {
    constructor(props) {
        super(props);
        this.state = {rows:[initialRow()]};
        this.getRowAt = this.getRowAt.bind(this);
        this.handleGridRowUpdate = this.handleGridRowUpdate.bind(this);
    }

    handleGridRowUpdate(context) {
        let rows = clone(this.state.rows);

        if(context.action === 'CELL_UPDATE') {
            let rowId = context.fromRow;
            let key = context.cellKey;

            let row = rows[rowId];
            row[key] = context.updated[key];

            let totalGross = row.qty*row.amount;
            let totalDiscount = totalGross*row.discount/100;
            let totalAfterDiscount = totalGross-totalDiscount;
            let totalGST = totalAfterDiscount*row.gst/100;
            row.total = totalAfterDiscount + totalGST;

            //Add new row on validation
            let prevRow = rows [rows.length-1];
            if(prevRow.total>0 && prevRow.item && prevRow.item.trim().length) {
                let newRow = initialRow();
                newRow.no = rows.length+1;
                rows.push(newRow);
            }

            this.setState({rows:rows});
        }
    }

    getRowAt(index) {
        return index<0 || index>this.state.rows.length ? undefined :this.state.rows.length;
    }

    render() {
        return (<div>
            <Form inline>
                <FormGroup>
                    <Col sm={3}><FormControl type="text" value={this.state.mobile} placeholder="Customer Mobile" /> </Col>
                    <Col sm={4}><FormControl type="text" value={this.state.name} placeholder="Customer Name" /> </Col>
                    <Col sm={3}><FormControl type="date" value={this.state.date} placeholder="Bill Date" /> </Col>
                </FormGroup>
            </Form>
            <ReactDataGrid
                columns={columns(flattenData(allItems))}
                ref ={node=>gridInstance=node}
                enableCellSelect={true}
                enableRowSelect={true}
                rowGetter={this.getRowAt}
                rowCount={this.state.rows.length}
                onGridRowsUpdated={this.handleGridRowUpdate}
                minHeight={400}
            />
            <div>
                <Button bsStyle="primary" onClick={this.handleSave}>Save Bill</Button>
                <Button bsStyle="default" onClick={this.handlePrint}>Print Bill</Button>
            </div>
        </div>)
    }
}

const mapStateToProps = (state)=>{
    return {
        allItems: state.retrieveItems.allItems
    }
}

const mapDispatchToProps = (dispatch) =>{
    return {
        saveBill: dispatch(USER_ACTIONS.CREATE_BILL);
    }
}