import React from 'react';

import {Login} from './login';
import {NewBill} from './billing/newBill';

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
        let component = <Login />;

        if(this.state.activeTab ===1) {
            component = <NewBill />;
        } else if (this.state.activeTab === '3.1') {
            component = <Report />;
        } else if (this.state.activeTab === '4.1') {
            component = <MenuItem />;
        }

        return (<div style={{width:'100%'}}>
                <Navbar inverse collapseOnSelect>
                    <Navbar.Header>
                        <Navbar.Brand>
                            <a href='#'> Billing System </a>
                        </Navbar.Brand>
                        <Navbar.Toggle>
                        </Navbar.Toggle>
                    </Navbar.Header>

                    <Navbar.Collapse>
                        <Nav bsStyle='pills' activeKey={this.state.activeTab} onSelect={this.handleSelect}>
                            <NavItem eventKey={1} href='#'> New Bill </NavItem>

                            <NavDropdown eventKey={4} title='Reports' id='nav-dropdown'>
                                <MenuItem eventKey='3.1'> Report1 </MenuItem>
                                <MenuItem eventKey='3.2'> Report2 </MenuItem>
                                <MenuItem divider />
                            </NavDropdown>
                        </Nav>
                        <Nav pullRight>
                            <NavItem eventKey={5} href='#'> Welcome </NavItem>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
                {component}
            </div>
        );
    }
}

