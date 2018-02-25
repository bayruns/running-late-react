import React from 'react';
import { Card, CardImg, CardBody, CardTitle, CardText, Button, CardSubtitle, Container, Row } from 'reactstrap';

export default class IconCard extends React.Component {
    render() {
        return (
            <div>
                <Card>
                    <CardImg top width="100%" src="https://placeholdit.imgix.net/~text?txtsize=33&txt=318%C3%97180&w=318&h=180" alt="Card image cap" />
                    <CardBody>
                        <CardTitle>{this.props.cardTitle}</CardTitle>
                        <CardSubtitle>Card subtitle</CardSubtitle>
                        <CardText>Some quick example text to build on the card title and make up the bulk of the card's content.</CardText>
                        <Button>Button</Button>
                    </CardBody>
                </Card>
            </div>
        );
    }
}