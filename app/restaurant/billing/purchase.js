import React from 'react'
import {connect} from 'react-redux';

import ReactDataGrid from 'react-data-grid';
import {Toolbar, Editors} from 'react-data-grid-addons';
import {Form, FormControl, FormGroup, Button, ControlLabel, Col, Row} from 'react-bootstrap';

import moment from 'moment';

import {clone, keyValueMap} from '../util/JSUtil';
import {execute} from '../network';
import {USER_ACTIONS} from '../constants';

import {getDetails} from '../util/ConfigUtil';

const columns = (allItems) =>{
    return [
        {key:'no',name:'#'},
        {key:'item',name:'Item', editor:<Editors.AutoComplete options={allItems} />},
        {key:'qty', name:'Quantity',editable:true, resizable:true},
        {key:'amount', name:'Amount',editable:true, resizable:true},
        {key:'discount', name:'Discount %',editable:true, resizable:true},
        {key:'gst', name:'GST %',editable:true, resizable:true},
        {key:'gstAmount', name:'GST Amount',editable:false, resizable:true},
        {key:'total', name:'Total',editable:false, resizable:true}
    ];
}

const flattenData= (allItems)=>{
    let data = [];
    allItems.forEach(item=>{
        if(item.Active === 'Y') {
            let row = {id:item.ItemId, title:item.Item};
            data.push(row);
        }
    });
    return data;
}

let gridInstance = null;

const initialRow = (defaultGST) => {
    return {no:1, item:'', qty:0, amount:0, discount:0, gst:defaultGST, total:0,gstAmount:0,totalMRP:0,totalDisc:0}
}

export class CreatePurchase extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rows:[initialRow(0)],
            date:moment().format('YYYY-MM-DD'),
            mobile:null,
            name:null,
            address:null,
            defaultGST:0,
            billAmount:0,totalDisc:0,totalGST:0,totalMRP:0,
            priceMap:keyValueMap(this.props.allItems, 'Item','Price'),
            nameIdMap:keyValueMap(this.props.allItems, 'Item','ItemId'),
        };
        this.handleGridRowUpdate = this.handleGridRowUpdate.bind(this);
        this.getRowAt = this.getRowAt.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSave = this.handleSave.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        let rows = clone(this.state.rows);
        this.setState({
            priceMap:keyValueMap(nextProps.allItems,'Item','Price'),
            nameIdMap:keyValueMap(nextProps.allItems, 'Item','ItemId'),
            rows:rows
        });
    }

    handleSave(e) {
        e.preventDefault();
        let bill = {};
        bill.billItems = [];
        let valid = this.state.mobile && this.state.mobile.length === 10;
        this.state.rows.forEach(row=>{
            let itemId = this.state.nameIdMap[row.item];
            if(!itemId && row.total){
                alert('Please select an item from teh list');
                return;
            }

            if(row.qty && row.amount) {
                let data = {
                    itemId:itemId,
                    qty: parseInt(row.qty),
                    price: parseFloat(row.amount),
                    gst: parseFloat(row.gst),
                    discount: parseFloat(row.discount)
                }
                bill.billItems.push(data);
                valid = valid && true;
            }
        });

        if(valid) {
            bill.user = this.props.userId;
            bill.address = this.state.address;
            bill.mobile = this.state.mobile;
            bill.name = this.state.name;
            bill.date = this.state.date;
            bill.billAmount = Number(this.state.billAmount);
            bill.type = 'PURCHASE';
            this.props.saveBill(bill);
        } else {
            alert('Entries are not valid. PLease fill Mobile NO and Items correct;y');
        }
    }

    handleGridRowUpdate(context) {
        let rows = clone(this.state.rows);

        if(context.action === 'CELL_UPDATE') {
            let rowId = context.fromRow;
            let row = rows[rowId];
            let key = context.cellKey;
            row[key] = context.updated[key];

            if(key === 'item') {
                row.amount=this.state.priceMap[context.updated[key]];
            }

            row.totalMRP = row.qty*row.amount;
            row.totalDisc = row.totalMRP*row.discount/100;
            let totalAfterDiscount = row.totalMRP-row.totalDisc;
            row.gstAmount = totalAfterDiscount*row.gst/100;
            row.total = totalAfterDiscount + row.gstAmount;

            //Add new row on validation
            let prevRow = rows [rows.length-1];
            if(prevRow.total>0 && prevRow.item && prevRow.item.trim().length) {
                let newRow = initialRow(0);
                newRow.no = rows.length+1;
                rows.push(newRow);
            }

            let billAmount=0,totalGST=0,totalMRP=0,totalDisc=0;
            rows.forEach(row=>{
                billAmount += row.total;
                totalGST += row.gstAmount;
                totalMRP += row.totalMRP;
                totalDisc += row.totalDisc;
            });

            this.setState({
                rows:rows,
                billAmount:billAmount.toFixed(2),
                totalGST:totalGST.toFixed(2),
                totalMRP:totalMRP.toFixed(2),
                totalDisc:totalDisc.toFixed(2)
            });
        }
    }

    getRowAt(index) {
        return index<0 || index>this.state.rows.length ? undefined :this.state.rows.length;
    }

    handleChange (e) {
        e.preventDefault();
        let currState = this.state;
        currState[e.target.name] = e.target.value;

        this.setState(currState);
    }

    render() {
        if(this.props.isFetching && this.props.configFetching) {
            return (<div> Loading</div>)
        }
        
        return (<div style={{margin:'20px'}}>
            <Form horizontal>
                <FormGroup>
                    <Col componentClass={ControlLabel} sm={3}><FormControl.Static>Mobile</FormControl.Static></Col>
                    <Col sm={4}><FormControl type="text" value={this.state.mobile} name='mobile' placeholder="Mobile" onChange={this.handleChange}/> </Col>
                </FormGroup>

                <FormGroup>
                    <Col componentClass={ControlLabel} sm={4}><FormControl.Static>Customer Name</FormControl.Static></Col>
                    <Col sm={4}><FormControl type="text" value={this.state.name} name='name' placeholder="Name" onChange={this.handleChange}/> </Col>
                </FormGroup>
                <FormGroup>
                    <Col componentClass={ControlLabel} sm={3}><FormControl.Static>Bill Date</FormControl.Static></Col>
                    <Col sm={4}><FormControl type="date" value={this.state.date} name='date' placeholder="Date" onChange={this.handleChange}/> </Col>
                <FormGroup>
                <FormGroup>
                    <Col componentClass={ControlLabel} sm={3}><FormControl.Static>Party Address</FormControl.Static></Col>
                    <Col sm={4}><FormControl type="text" value={this.state.address} name='address' placeholder="Address" onChange={this.handleChange}/> </Col>
                <FormGroup>
                </FormGroup>
            </Form>
            <ReactDataGrid
                columns={columns(flattenData(this.props.allItems))}
                ref ={node=>gridInstance=node}
                enableCellSelect={true}
                enableRowSelect={true}
                rowGetter={this.getRowAt}
                rowsCount={this.state.rows.length}
                onGridRowsUpdated={this.handleGridRowUpdate}
                minHeight={500}
            />

            <div className='pull-left' style={{width:'100%'}}>
                <div className='pull-right' style={{width:'320px'}}>
                    <strong>
                        <Row>
                            <Col lg={6}>Total MRP</Col>
                            <Col lg={6}>{this.state.totalMRP}</Col>
                        </Row>
                        <Row>
                            <Col lg={6}>Total Discount</Col>
                            <Col lg={6}>{this.state.totalDisc}</Col>
                        </Row>
                        <Row>
                            <Col lg={6}>Total GST</Col>
                            <Col lg={6}>{this.state.totalGST}</Col>
                        </Row>
                        <Row>
                            <Col lg={6}>Total Bill Amount</Col>
                            <Col lg={6}>{this.state.billAmount}</Col>
                        </Row>
                    </strong>
                </div>

            </div>
            
            <hr />
            <div className='pull-left' align='center' style={{width:'100%'}}>
                <Button bsStyle="primary" onClick={this.handleSave}>Create Purchase</Button>
            </div>
        </div>)
    }
}

const mapStateToProps = (state)=>{
    return {
        allItems: state.retrieveItems.items.filter(item=> item.Type === 'PURCHASE'),
        itemFetching: state.retrieveItems.fetching,
        configs: state.retrieveConfigs.configs,
        configFetching: state.retrieveConfigs.fetching,
        userId : state.fetchLogin.login.UserId
    }
}

const mapDispatchToProps = (dispatch) =>{
    return {
        savePurchase : (bill)=>dispatch(execute(USER_ACTIONS.CREATE_PURCHASE, null, bill))
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(CreatePurchase)