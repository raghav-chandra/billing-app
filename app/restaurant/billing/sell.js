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

export class NewBill extends React.Component {
    constructor(props) {
        super(props);
        let defaultGST = getDetails(this.props.configs).defaultGST;
        this.state = {
            rows:[],
            date:moment().fromat('YYYY-MM-DD'),
            mobile:null,
            name:null,
            defaultGST:defaultGST ? defaultGST : 0,
            billAmount:0,totalDisc:0,totalGST:0,totalMRP:0,
            priceMap:keyValueMap(this.props.allItems, 'Item','Price'),
            nameIdMap:keyValueMap(this.props.allItems, 'Item','ItemId')
        };
        this.getRowAt = this.getRowAt.bind(this);
        this.handleGridRowUpdate = this.handleGridRowUpdate.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSave = this.handleSave.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        let rows = this.state.rows;
        let gst = getDetails(nextProps.configs).defaultGST;
        if(!rows.length && gst) {
            ros.push(initialRow(gst));
        }
        this.setState({
            priceMap:keyValueMap(nextProps.allItems,'Item','Price'),
            nameIdMap:keyValueMap(nextProps.allItems, 'Item','ItemId'),
            defaultGST:getDetails(nextProps.configs).defaultGST,
            rows : rows
        });
    }

    handleSave(e) {
        e.preventDefault();
        let bill = {};
        bill.billItems = [];
        let valid = this.state.mobile && this.state.mobile.length === 10;
        this.state.rows.forEach(row=>{
            let itemId = this.state.nameIdMap[row.item];
            if(!itemId){
                alert('Please select an item from teh list');
                return;
            }

            if(row.qty && row.amount) {
                let data = {
                    itemId,
                    qty : parseInt(row.qty),
                    price : parseFloat(row.amount),
                    gst : parseFloat(row.gst),
                    discount : parseFloat(row.discount)
                };
                bill.billItems.push(data);
                valid = true;
            }
        });

        if(valid) {
            bill.user = this.props.userId;
            bill.address = 'Online';
            bill.mobile = this.state.mobile;
            bill.name = this.state.name;
            bill.date = this.state.date;
            bill.billAmount = Number (this.state.billAmount);
            this.props.saveBill(bill);
        } else {
            alert('Entry is invalid, PLease fill Mobil and Bill Items correctly');
        }
    }

    handleGridRowUpdate(context) {
        let rows = clone(this.state.rows);

        if(context.action === 'CELL_UPDATE') {
            let rowId = context.fromRow;
            let key = context.cellKey;
            let row = rows[rowId];
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
                let newRow = initialRow(this.state.defaultGST);
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
        if(this.props.itemFetching || this.props.configFetching) {
            return (<div> Loading</div>)
        }
        
        return (<div style={{margin:'20px'}}>
            <Form horizontal>
                <FormGroup>
                    <Col componentClass={ControlLabel} sm={3}><FormControl.Static>Mobile</FormControl.Static></Col>
                    <Col componentClass={ControlLabel} sm={4}><FormControl.Static>Customer Name</FormControl.Static></Col>
                    <Col componentClass={ControlLabel} sm={3}><FormControl.Static>Bill Date</FormControl.Static></Col>
                </FormGroup>
                <FormGroup>
                    <Col sm={3}><FormControl type="text" value={this.state.mobile} name='mobile' placeholder="Mobile" onChange={this.handleChange}/> </Col>
                    <Col sm={4}><FormControl type="text" value={this.state.name} name='name' placeholder="Name" onChange={this.handleChange}/> </Col>
                    <Col sm={3}><FormControl type="date" value={this.state.date} name='date' placeholder="Date" onChange={this.handleChange}/> </Col>
                </FormGroup>
            </Form>
            <ReactDataGrid
                columns={columns(flattenData(this.props.allItems))}
                ref ={node=>gridInstance=node}
                enableCellSelect={true}
                enableRowSelect={true}
                rowGetter={this.getRowAt}
                rowCount={this.state.rows.length}
                onGridRowsUpdated={this.handleGridRowUpdate}
                minHeight={400}
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
                <Button bsStyle="primary" onClick={this.handleSave}>Save Bill</Button>
                <Button bsStyle="default" onClick={this.handlePrint}>Print Bill</Button>
            </div>
        </div>)
    }
}

const mapStateToProps = (state)=>{
    return {
        allItems: state.retrieveItems.items,
        itemFetching: state.retrieveItems.fetching,
        configs: state.retrieveConfigs.configs,
        configFetching: state.retrieveConfigs.fetching,
        userId: state.fetchLogin.login.UserId
    }
}

const mapDispatchToProps = (dispatch) =>{
    return {
        saveBill: (bill)=>dispatch(execute(USER_ACTIONS.CREATE_BILL, null, bill))
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(NewBill)