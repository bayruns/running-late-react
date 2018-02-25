import React from 'react';
import { Jumbotron, Container, Row, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import { PAGES } from '../Routing/constants.js';
import './landingpage.css';

export default class NotFoundPage extends React.Component {
    render() {
        return (
            <div className="masthead">
                <Container>
                    <Row className="justify-content-center">
                        <Jumbotron className="text-center jumobtron-transparent">
                            <h1 className="display-3 text-center running-late-title">404 - Page Not Found</h1>
                            <hr className="my-2" />
                            <Link to={PAGES.LANDING.URL}><Button className="landing-page-button" size="lg" color="primary">Back to Main</Button></Link>
                        </Jumbotron>
                    </Row>
                </Container>
            </div>
        );
    }
}