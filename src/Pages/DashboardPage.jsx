import React from 'react';
import { Jumbotron, Container, Row, Button, Form, Input, InputGroup, InputGroupAddon, Col } from 'reactstrap';
import RunningLateNavbar from '../Navbars/RunningLateNavbar.jsx';
import { Link } from 'react-router-dom';
import { PAGES } from '../Routing/constants.js';
import Binder from '../util/binder.js';
import RequestHandler from '../util/RequestHandler.js';
import './landingpage.css';

export default class DashboardPage extends React.Component {

    constructor() {
        super();
        //creater a new binder and bind all of the methods in this class
        var binder = new Binder();
        binder.bindAll(this, DashboardPage);
        this.state = {
            name: '',
            employees: [{ name: '' }],
            address: '',
            link: ""
        };
    }

/*     handleNameChange = (evt) => {
        this.setState({ name: evt.target.value });
    }

    handleemployeeNameChange = (idx) => (evt) => {
        const newemployees = this.state.employees.map((employee, sidx) => {
            if (idx !== sidx) return employee;
            return { ...employee, name: evt.target.value };
        });

        this.setState({ employees: newemployees });
    }
    */

    handleSubmit = (evt) => {

        const endpoint = "invite";
        const success = "Link Created Successfully.";
        const error = "Link Creatiation Failed.";
        const data = {
            address: this.state.address
        }
        const self = this;
        var callback = function (responseData) {
            self.setState({ link: responseData });
            console.log(responseData)
            self.props.history.push("/dashboard");
        };
        var handler = new RequestHandler();
        handler.post(endpoint, data, success, error, callback);
    }

    /*
    handleAddemployee = () => {
        this.setState({ employees: this.state.employees.concat([{ name: '' }]) });
    }

    handleRemoveemployee = (idx) => () => {
        this.setState({ employees: this.state.employees.filter((s, sidx) => idx !== sidx) });
    } */

    updateAddress(e) {
        this.setState({
            address: e.target.value
        })
    }

    render() {
        return (
            <Container className="vertical-center">
                <Row className="justify-content-center">
                    <Col xs={{ size: 12, offset: 0 }} sm={{ size: 11 }} md={{ size: 8 }} lg={{ size: 5 }}>
                        <h1 className="running-late-title">Invite Employees</h1>
                        <Form>
                            <InputGroup className="vertical-spaced">
                                <InputGroupAddon> Address: </InputGroupAddon>
                                <Input type='text' onChange={this.updateAddress} />
                            </InputGroup>
                            &nbsp;
                            <Button className="" onClick={this.handleSubmit}>Get Link</Button>
                            &nbsp; 
                            <div>
                                <Input type="text" placeholder={this.state.link} />
                            </div>
                        </Form>
                    </Col>
                </Row>
                <Row className="justify-content-center row-spaced">
                    <Button className="btn-primary" size="lg" onClick={this.submit}>Signup</Button>
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