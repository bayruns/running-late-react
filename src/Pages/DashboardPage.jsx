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
        this.state = {
            name: '',
            employees: [{ name: '' }],
        };
    }

    handleNameChange = (evt) => {
        this.setState({ name: evt.target.value });
    }

    handleemployeeNameChange = (idx) => (evt) => {
        const newemployees = this.state.employees.map((employee, sidx) => {
            if (idx !== sidx) return employee;
            return { ...employee, name: evt.target.value };
        });

        this.setState({ employees: newemployees });
    }

    handleSubmit = (evt) => {
        const { name, employees } = this.state;
        // alert(`Incorporated: ${name} with ${employees.length} employees`);
        console.log(this.state.employees);

        const endpoint = "employeesInvitationList/";
        const success = "Employees Invited Successfully.";
        const error = "Employees Invitation Failed.";
        const data = {
            emails: this.state.employees
        }
        const self = this;
        var callback = function (responseData) {
            self.setState({ itemRows: responseData });
            console.log(responseData)
            self.props.history.push("/dashboard");
        };
        var handler = new RequestHandler();
        handler.post(endpoint, data, success, error, callback);
    }

    handleAddemployee = () => {
        this.setState({ employees: this.state.employees.concat([{ name: '' }]) });
    }

    handleRemoveemployee = (idx) => () => {
        this.setState({ employees: this.state.employees.filter((s, sidx) => idx !== sidx) });
    }

    render() {
        return (
            <Container className="vertical-center">
                <Row className="justify-content-center">
                    <Col xs={{ size: 12, offset: 0 }} sm={{ size: 11 }} md={{ size: 8 }} lg={{ size: 5 }}>
                        <h1 className="running-late-title">Invite Employees</h1>
                        <Form>
                            <div className="inviteEmployees">

                                {this.state.employees.map((employee, idx) => (
                                    <div className="employee ">
                                        <Input
                                            type="email"
                                            placeholder={`Email of Employee #${idx + 1}`}
                                            value={employee.name}
                                            onChange={this.handleemployeeNameChange(idx)}
                                        />
                                        &nbsp;
                                    <Button type="button" onClick={this.handleRemoveemployee(idx)} className="small">X</Button>
                                    </div>
                                ))}
                            </div>
                            <Button type="button" onClick={this.handleAddemployee} className="small">Add employee</Button>
                            &nbsp; &nbsp;
                            <Button className="btnSubmitType" onClick={this.handleSubmit}>Invite All</Button>
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