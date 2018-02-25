import React from 'react';
import { Jumbotron, Container, Row, Button } from 'reactstrap';
import RunningLateNavbar from '../Navbars/RunningLateNavbar.jsx';
import { Link } from 'react-router-dom';
import { PAGES } from '../Routing/constants.js';
import './landingpage.css';

export default class DashboardPage extends React.Component {
    render() {
        return (
            <div className="masthead">
                <Container>
                    <Row className="justify-content-center">
                        <Jumbotron className="text-center jumobtron-transparent">
                            <h1 className="display-3 text-center running-late-title">running late</h1>
                            <hr className="my-2" />
                            <Link to={PAGES.LOGIN.URL}><Button className="landing-page-button" size="lg" color="primary">Login</Button></Link>
                            <Link to={PAGES.SIGNUP.URL}><Button className="landing-page-button" size="lg" color="primary">Signup</Button></Link>
                        </Jumbotron>
                    </Row>
                </Container>
            </div>
        );
    }
}