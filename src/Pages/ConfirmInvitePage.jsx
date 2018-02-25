import React from 'react';
import { Jumbotron, Container, Button, Input, Row, Col, InputGroup, InputGroupAddon, Alert } from 'reactstrap';
import { Form, FormGroup, Label, FormText, Card, CardImg, CardBody, CardTitle, CardText, CardSubtitle } from 'reactstrap';

import { Link } from 'react-router-dom';
import Binder from '../util/binder.js';
import RequestHandler from '../util/RequestHandler.js';
import IconCard from '../IconCard.jsx';
import './landingpage.css';
import moment from 'moment';

export default class SignupPage extends React.Component {

    constructor(props) {
        super(props);
        //creater a new binder and bind all of the methods in this class
        var binder = new Binder();
        binder.bindAll(this, SignupPage);

        this.state = {
            days: [false, false, false, false, false, false, false],
            departure_time: "00:00",
            starting_address: "",
            transportation_method: "driving"
        }
    }

    componentDidMount() {
        console.log("props", this.props)
        var ending_address = this.props.match.params.address;
        var boss_id = this.props.match.params.id;
        this.setState({
            ending_address: ending_address,
            boss_id: boss_id
        });
        console.log("component mounted, state:", this.state)
    }

    dayChecked(event) {
        var day = event.target.value;
        var days = this.state.days.slice();
        days[day] = !days[day];
        this.setState({ days: days });
        console.log(day)
    }

    updateTime(e) {
        console.log("time", e.target.value);
        this.setState({
            departure_time: e.target.value
        });
        console.log("time updated, state:", this.state)

    }

    updateAddress(e) {
        this.setState({
            starting_address: e.target.value
        })
    }

    updateTransporation(e) {
        this.setState({
            transportation_method: e.target.value
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
            this.confirm();
        }
    }

    confirm() {
        const endpoint = "confirm-invite/";
        const success = "Invite Confirmed."
        const error = "Confirmation Failed."
        

        const selected_days = [];
        for(let i = 0; i < this.state.days.length; i++){
            if(this.state.days[i]){
                selected_days.push(i);
            }
        }

        //Your moment
        var mmt = moment(this.state.departure_time, 'HH:mm');
        // Your moment at midnight
        var mmtMidnight = mmt.clone().startOf('day');
        // Difference in minutes
        var diffMinutes = mmt.diff(mmtMidnight, 'minutes');
        data.departure_time = diffMinutes;

        const data = {
            days: selected_days,
            starting_address: this.state.starting_address,
            ending_address: this.state.ending_address,
            departure_time: diffMinutes,
            transportation_method: this.state.transportation_method,
            boss_id: this.state.boss_id
        }

        const self = this;
        var callback = function (responseData) {
            console.log(responseData);
            self.props.history.push("/dashboard");
        };
        var handler = new RequestHandler();
        handler.post(endpoint, data, success, error, callback);
    }

    render() {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let day_forms = [];
        for (var day in days) {
            day_forms.push(
                <FormGroup check>
                    <Label check>
                        <Input value={day} type="checkbox" onChange={this.dayChecked} /> {days[day]}
                    </Label>
                </FormGroup>
            );
        }
        return (
            <Container>
                <Row className="justify-content-center">
                    <Jumbotron className="text-center jumobtron-transparent">
                        <h1 className="display-3 text-center running-late-title">Confirm Invite</h1>
                        <hr className="my-2" />
                    </Jumbotron>
                </Row>
                <Row className="justify-content-center">
                    <Col xs={{ size: 6, offset: 0 }}>
                        <Form>
                            <FormGroup className="running-late-text">
                                <Label for="from-address">From Address</Label>
                                <Input onChange={this.updateAddress} type="text" name="time" id="from-address" />
                            </FormGroup>
                        </Form>
                    </Col>
                    <Col xs={{ size: 6, offset: 0 }} className="running-late-text">
                        <Label for="to-address">To Address</Label>

                        <p id="to-address" className="running-late-text">
                            {this.state.ending_address}
                        </p>
                    </Col>
                </Row>
                <Row className="justify-content-center">
                    <Col xs={{ size: 6, offset: 0 }} sm={{ size: 4 }} md={{ size: 3 }} lg={{ size: 2 }}>
                        <Form>
                            <Label className="running-late-text">
                                Transportation Method
                                <Input type="select" onChange={this.updateTransporation}>
                                    <option value="driving">Driving</option>
                                    <option value="bicycling">Bicycling</option>
                                    <option value="walking">Walking</option>
                                    <option value="transit">Transit</option>
                                </Input>
                            </Label>
                            <FormGroup className="running-late-text">
                                <Label for="departure-time">Time</Label>
                                <Input onChange={this.updateTime} type="time" name="time" id="departure-time" placeholder="time placeholder" />
                            </FormGroup>
                        </Form>
                    </Col>
                    <Col className="running-late-text" xs={{ size: 6, offset: 0 }} sm={{ size: 6 }} md={{ size: 3 }} lg={{ size: 2 }}>
                        Days
                        <Form>
                            {day_forms}
                        </Form>
                    </Col>
                </Row>
                <Row className="justify-content-center">
                    <Button onClick={this.submit} color="info" size="lg" className="running-late-text">Confirm</Button>
                </Row>
            </Container>
        );
    }
}