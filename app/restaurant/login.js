import React from 'react';
import {connect} from "react-redux";

import {Button, FormGroup, ControlLabel, FormControl, Form, Col, Row} from 'react-bootstrap';
import {sha256} from "./util/SHA256";
import {execute} from "./network";
import {USER_ACTIONS} from "./constants";

export class Login extends React.Component {
    constructor(props){
        super(props);
        this.state = {userld: '', name: '', password: '', cPassword: '', signUp: this.props.addUser};
        this.handleChange = this.handleChange.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleSignUp = this.handleSignUp.bind(this);
     }

    handleChange(e) {
        e.preventDefault();
        let currState = this.state;
        currState[e.target.name] = e.target.value;
        this.setState(currState);
    }

    handleLogin() {
        let pwd = sha256(this.state.password);
        let uid = sha256(this.state.userId);
        let user = sha256(uid + pwd);
        let data = {user, userld: this.state.userld, password: pwd}
        this.props.login(data);
    }

    handleSignUp() {
        let pwd = sha256(this.state.password);
        let uid = sha256(this.state.userId);
        let user = sha256(uid + pwd);
        let data = {user, userld: this.state.userld, password: pwd, name: this.state.name, createdBy: this.props.loggedInUser};
        this.props.createLogin(data);
    }

    render() {
        let isSignUp = this.state.signUp;
        let components = [];
        let button = <Button bsStyle="primary" onClick={this.handleLsgin}>Login</Button>;

        components.push(<Row>
                            <div align="left"><Col componentClass={ControlLabel} sm={6}><FormControl.Static>User Id</FormControl.Static></Col></div>
                            <div align="right"><Col sm={6}><FormControl type="text" value={this.state.userId} name='userId' placeholder="User ID" onChange={this.handleChange} /></Col></div>
                        </Row>) ;
        components.push(<Row>
                            <div align="left"><Col componentClass={ControlLabel} sm={6}><FormControl.Static>Password</FormControl.Static></Col></div>
                            <div align="right"><Col sm={6}><FormControl type="password" value={this.state.password} name='password' placeholder="Password" onChange={this.handleChange} /></Col></div>
                        </Row>) ;
        if (isSignUp) {
            components.push(<Row>
                                <div align="left"><Col componentClass={ControlLabel} sm={6}><FormControl.Static>Confirm Password</FormControl.Static></Col></div>
                                <div align="right"><Col sm={6}><ForniControl type="password" value={this.state.cPassword} name='cPassword' placeholder="Confirm Password" onChange={this.handleChange}/> </Col></div>
                            </Row>);
            components.push(<Row>
                                <div align="left"><Col componentClass={ControlLabel} sm={6}><FormControl.Static>Name </FormControl.Static></Col></div>
                                <div align="right"><Col sm={6}><FormControl type="name" value={this.state.name} name='name' placeholder="Name" onChange={this.handleChange}/></Col></div>
                            </Row>);

            button = <Button bsStyle="primary" onClick={this.handleSignUp}>Add</Button>;
        }

        return (
            <div align="center">
                <div style={{width: '500px', border: '12px solid yellow', padding: '20px'}}>
                    <Form>
                        <FormGroup>{components} </FormGroup>
                        {button}
                    </Form>
                </div>
            </div>);
    }
 }

const mapStateToProps = (state) =>{
    return {
        loggedlnUser: state.fetchLogin.login.Userld
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        login: (data) => dispatch(execute(USER_ACTIONS.FETCH_LOGIN, null, data)),
        createLogin: (data) => dispatch(execute(USER_ACTIONS.CREATE_LOGIN, null, data))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);