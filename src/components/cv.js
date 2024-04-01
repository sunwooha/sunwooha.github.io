import {Container, Row, Col} from 'react-bootstrap'
import React from 'react';
import './components.css';
import cv from '../data/cv.pdf';


function CV() {
    return (
        <>
            <Container className='section' id='cv'>
                <Row>
                    <Col lg={12}>
                        <Row className='resume-comp'>
                            <h3 className="mb-0">Curriculum Vitae</h3>
                        </Row>
                        <Row className='resume-comp padding'>
                            <Col lg={12}>
                                <p>You may download my updated academic CV <a href={cv} target={'_blank'}>here</a>.</p>
                            </Col>
                        </Row>

                    </Col>
                </Row>
                <hr></hr>
            </Container>
        </>
    )
}

export default CV;