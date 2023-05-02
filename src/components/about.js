import {Container, Row, Col, Image } from 'react-bootstrap'
import React from 'react';
import './components.css'
import img from '../data/img.jpg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faGithub, faLinkedinIn } from '@fortawesome/free-brands-svg-icons'
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons'


function About() {
    return (
        <>
            <Container className='section' id='about'>
                <Row className='resume-comp'>
                    <Col className='profile-img-container' lg={{span:4, order: 1}}>
                        <Row className='padding profile-img'>
                            <Image className='profile-img' src={img}></Image>
                        </Row>
                        <div className='nameemaildiv'>
                            <h2 className="mb-0 padding">Sunwoo Jennifer Ha</h2>
                            <h5 className="mb-0">Washington University in St. Louis</h5>
                            <code>sha [at] wustl [dot] edu</code>
                        </div>
                        <div className='linkdiv'>
                                <a className='social' href="https://www.linkedin.com/in/sunwoo-ha/" target="_blank">
                                    <FontAwesomeIcon icon={faLinkedinIn}></FontAwesomeIcon>
                                </a>
                                <a className='social' href="https://github.com/sunwooha" target="_blank">
                                    <FontAwesomeIcon icon={faGithub}></FontAwesomeIcon>
                                </a>
                                <a className='social' href="https://scholar.google.com/citations?user=J7HAEDgAAAAJ&hl" target="_blank">
                                    <FontAwesomeIcon icon={faGraduationCap}></FontAwesomeIcon>
                                </a>
                            </div>
                    </Col>

                    <Col className='padding' lg={{span:8, order: 2}}>
                            <div className='aboutmediv'>
                                <h3 className="mb-0">About Me</h3>
                            </div>
                            
                            <p className="mb-5">I am currently a 4th year Ph.D. candidate in the <a href="http://visualdata.wustl.edu/" target="_blank">Visual Data Analysis Group</a> at Washington University in St. Louis, advised by Dr. <a href={'https://engineering.wustl.edu/faculty/Alvitta-Ottley.html'} target={'_blank'}>Alvitta Ottley</a>. 
                            My research interests are in <b>Visual Analytics</b> and <b>Human-Computer Interaction</b>. Most of the work throughout my Ph.D. has focused on leveraging user interactions within an interactive visual exploration system to asisst users in real-time data exploration.</p>

                           <p className="mb-5">Before joining WashU, I recieved a B.A. in Computer Science from New College of Florida.</p>


                    </Col>
                </Row>
                <hr></hr>
            </Container>
        </>
    )
}

export default About;