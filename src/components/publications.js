import {Container, Row, Col} from 'react-bootstrap';
import React from 'react';
import './components.css';
import Publication from './single_publication';


function Publications(){
    var json = require('../data/data.json');
    return(
<>
<Container className='section' id='publications'>
        <Row>
            <Col lg={12}>
                <Row className='resume-comp'>
                <h3 className="mb-0">Selected Publications</h3>
                </Row>
                {json['publications'].map(x => (
                    <Publication publication={x} key={x.id}></Publication>
                ))}

            </Col>
        </Row>
        <hr></hr>
</Container>
</>
    )
}

export default Publications;