import React from 'react';
import {connect} from 'react-redux' ;
import {Modal, Button} from react-bootstrap ;
Import {billModal} from "../actions";
import {getDetails} from "../util/ConfigUtil";
import {keyValueMap} from "../util/JSUtil";

class BillModal extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.handleClose = this.handleClose.bind(this);
        this.handlePrint = this.handlePrint.bind(this);
    } 
    
    handleClose() {
        this.props.close();
    }
    
    handlePrint() {
        let mywindow = window.open(", 'PRINT', 'height=400,width=600');
        mywindow.document.write('<html><head><title><title></head><body>');
        mywindow.document.write(document.getElementById('printBillDiv').innerHIML);
        mywindow.document.write('</body></html>');
        mywindow.document.close();
        mywindow.focus();
        mywindow.print();
        mywindow.close();
    }

    render() {
        if (this.props.itemsFetching || this.props.configFetching || !this.props.bill) {
            return (<div/>);
        }

        let itemMap = keyValueMap(this.props.items, 'Itemld', 'Item');
        let config = getDetails(this.props.configs);
        let customer = this.props.bill.customer;
        let custName = customer.name;
        let mobile = customer.mobile;
        let address = customer.address;
        let date = this.props.bill.date;
        let billId = this.props.bill.billId;
        let billItems = this.props.bill.billItems;
        let content = [];
        let counter = 1;
        let totalMRP = 0, totalDisc = 0, totalGST = 0, finalAmount = 0;

        billItems.forEach(bItem => {
            let mrpTotal = bItem.qty * bItem.price;
            totalMRP += mrpTotal;
            let discount = (mrpTotal * bltem.discount) / 100;
            totalDisc += discount;
            let gst = ((mrpTotal - discount) * bltem.gst) / 100;
            totalGST += gst;
            let totalAmount = (mrpTotal - discount) + gst;
            finalAmount += totalAmount;
            let elem = (<tr>
                            <td>{counter++}</td>
                            <td>{itemMap[bItem.itemId]}</td>
                            <td>{bItem.qty}</td>
                            <td>{bItem.price}</td>
                            <td>{bItem.discount}</td>
                            <td>{bItem.gst}</td>
                            <td>{totalAmount}</td>
                    </tr>);
            content.push(elem);
        });

        return (<div>
                    <Modal show={this.props.open} onHide={this.handleClose}>
                        <Modal.Header closeButton><Modal.Title>Modal heading</Modal.Title></Modal.Header>
                        <Modal.Body>
                            <div id='printBiliDiv' style={{width: 1148mml, height: '210mm', border: 'blue solid'}}>
                                <div align="center">
                                    <h3>{config.company}></h3>
                                    <h4>{config.companyAddress1}</h4>
                                    <h4>{config.companyAddress2}</h4>
                                    <h4>{config.companyLandLine1} {config.companyLandLine2} {config.companyMobilel} {config.companyMobile2}</h4>
                                    <h4>GSTIN : {config.companyGSTIN}</h4>
                                </div>
                                <div>
                                    <div className="pull-left">
                                        <div>Name : {custName}</div>
                                        <div>Mobile : {mobile}</div>
                                        <div>Mobile : {address}</div>
                                    </div>
                                    <div className="pull-right">
                                        <div>Invoice No : {billId} </div>
                                        <div>Invoice Date : {date}</div>
                                    </div>
                                    <div>
                                        <table width="1008" border='lpx solid blue'>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Item</th>
                                                    <th>Quantity</th>
                                                    <th>MRP</th>
                                                    <th>Discount</th>
                                                    <th>GST</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>{content}</tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={this.handlePrint}>Print</Button>
                            <Button onClick={this.handleClose}>Close </Button>
                        </Modal.Footer>
                    </Modal>
                </div>);
    }
}

const mapStateToProps = (state) => {
    return {
            open: state.billModal.open,
            bill: state.BillModal.bill,
            configs: state.retrieveConfigs.configs,
            items: state.retrieveltems.items,
            itemsFetching: state.retrieveItems.fetching,
            configFetching: state.retrieveConfigs.fetching
        }
};
const mapDispatchToProps = (dispatch) => {
    return {
        close: () => dispatch(BillModal(null, false))
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(BillM