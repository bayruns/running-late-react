import React from 'react';
import { Container, Button, Input, Row, Col, InputGroup, InputGroupAddon, Alert } from 'reactstrap';
import { Link } from 'react-router-dom';
import Binder from '../util/binder.js';
import RequestHandler from '../util/RequestHandler.js';
import Cookies from 'js-cookie';

export default class LoginPage extends React.Component {

    constructor(props) {
        super(props);
        //creater a new binder and bind all of the methods in this class
        var binder = new Binder();
        binder.bindAll(this, LoginPage);

        this.state = {
            phone: "",
            password: "",
            warning: ""
        }
    }

    updatePhone(e) {
        this.setState({
            phone: e.target.value
        });
    }

    updatePassword(e) {
        this.setState({
            password: e.target.value
        })
    }

    submit() {
        var warning;
        if (this.state.password === "") {
            warning = <Alert color="danger">Please enter a password.</Alert>;
        } else if (this.state.phone === "") {
            warning = <Alert color="danger">Please enter a valid phone.</Alert>;
        } else {
            warning = ""
        }
        this.setState({
            warning: warning
        })
        if (this.state.warning === "") {
            this.login();
        }
    }

    login() {
        const endpoint = "login/";
        const success = "Login Successful."
        const error = "Login Failed."
        const data = {
            phone: this.state.phone,
            password: this.state.password
        }
        const self = this;
        var callback = function (responseData) {
            console.log(responseData)
            const inAnHour = 1 / 24;
            Cookies.set('token', responseData.token, {
                expires: inAnHour
            });
            self.props.history.push("/dashboard");
        };
        var handler = new RequestHandler();
        handler.post(endpoint, data, success, error, callback);
    }

    render() {
        return (
            <Container className="vertical-center">
                <Row className="justify-content-center">
                    <Col xs={{ size: 12, offset: 0 }} sm={{ size: 10 }} md={{ size: 8 }} lg={{ size: 6 }}>
                        <h1 className="running-late-title">Login</h1>
                        <InputGroup className="vertical-spaced">
                            <InputGroupAddon>Phone: </InputGroupAddon>
                            <Input type='number' onChange={this.updatePhone} />
                        </InputGroup>
                        <InputGroup>
                            <InputGroupAddon>Password: </InputGroupAddon>
                            <Input type='password' onChange={this.updatePassword} />
                        </InputGroup>
                    </Col>
                </Row>
                <Row className="justify-content-center row-spaced">
                    <Button className="btn-primary" size="lg" onClick={this.submit}>Login</Button>
                    <Link to='/'><Button className="btn-primary" size="lg">Back to Main</Button></Link>
                </Row>
                <Row className="justify-content-center row-spaced">
                    <Col xs={{ size: 12, offset: 0 }} sm={{ size: 10 }} md={{ size: 8 }} lg={{ size: 6 }}>
                        {this.state.warning}
                    </Col>
                </Row>
            </Container>
        );
    }
}