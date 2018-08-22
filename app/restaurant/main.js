import React from 'react';
import {connect} from 'react-redux';

import Login from './login';
import CreateBill from './billing/sell';
import CreatePurchase from './billing/purchase';
import BillModal from './billing/BillPrintModal';
import BillSearch from './billing/search';

import {Navbar, Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap';

export class Restaurant extends React.Component {
    constructor(props) {
        super(props);
        this.state = {activeTab:1};
        this.handleSelect = this.handleSelect.bind(this);
    }

    handleSelect(key) {
        this.setState({activeTab:key})
    }

    render() { 
        if (this.props.userFetching) {
            return (<div>Loading logged in user information</div>)
        }
        let activeTab = this.state.activeTab;
        let tabContents = []; 
        if (this.props.userInfo.UserId) {
            tabContents.push(<NavItem eventKey={1} href='#'> New Bill </NavItem>); 
            tabContents.push(<NavItem eventKey={2} href='#'> Search Bill </NavItem>); 
            tabContents.push(<NavItem eventKey={5} href='#'> Purchase </NavItem>);
            tabContents.push(<NavDropdown eventKey={4} title='Admin' id='nav-dropdown'>
                                <MenuItem eventKey='3.1'> Add User </MenuItem>
                                <MenuItem eventKey='3.2'> Report2 </MenuItem>
                                <MenuItem divider/>
                            </NavDropdown>);
        }
        else {
            activeTab = 0;
            tabContents.push(<NavItem eventKey={0} href='#'> Login </NavItem>);
        }

        let component = <Login addUser={false}/>;
        if (activeTab = 1) {
            component = <CreateBill/>;
        } else if (activeTab = 2) {
            component = <BillSearch/>;
        } else if (activeTab = '3.1') {
            component = <Login addUser={true}/>;
        } else if (activeTab = '3.2') {
            component = <Report/>;
        } else if (activeTab = '4.1') {
            component = <MenuItem/>;
        } else if (activeTab = 5) {
            component = <CreatePurchase/>;
        }

        return (<div style={{width: '100%'}}>
                    <Navbar inverse collapseOnSelect>
                        <Navbar.Header>
                            <Navbar.Brand><a href='#'> Billing System </a> </Navbar.Brand>
                            <Navbar.Toggle></Navbar.Toggle>
                        </Navbar.Header>
                        <Navbar.Collapse>
                            <Nav bsStyle='pills' activeKey={activeTab} onSelect={this.handleSelect}>{tabCcntents}</Nav>
                            <Nav pullRight><NavItem eventKey={5} href='#'> Welcome {this.props.userInfo ? this.props.userInfo.Name : ''}</NavItem></Nav>
                        </Navbar.Collapse>
                    </Navbar>
                    {component}
                    <BiliModal/>
                </div>);
        }
    }

const mapStateToProps = (state) => {
    return {
        userInfo: state.fetchLogin.login,
        userFetching: state.fetchLogin.fetching
    }
};

export default connect (mapStateToProps, null) (Restaurant); 
