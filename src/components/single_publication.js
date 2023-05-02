import React from 'react';
import {Row, Col} from 'react-bootstrap';
import './components.css';
import 'bootstrap/dist/css/bootstrap.min.css';


function Publication(props){
    let authors = props.publication.authors.split(', ');
    let bold_index = 0;
    let spacer = '';
    for (let i = 0; i < authors.length; i++){
        if(authors[i] === 'Sunwoo Ha'){
            authors[i] = <b>Sunwoo Ha</b>;
            bold_index = i;
            if (i !== 0){
                spacer = ', '
            }
        }
    }
    let authors1 = authors.slice(0,bold_index).join(', ');
    let authors2 = authors.slice(bold_index+1).join(', ');

    return(
<>
    <Row className='resume-comp publication'>
        <Col lg={12}>
            <div>{props.publication.title}</div>
            <div className='text-muted'>{authors1}{spacer}{authors[bold_index]}{', '}{authors2}</div>
            <div className='text-muted'><em>{props.publication.venue}</em></div>
            <div>
            <h6><span className='badge badge-secondary'>{props.publication.type}</span>&nbsp;
            <small><a href={props.publication.link} target="_blank">Manuscript</a></small></h6>
            </div>
        </Col>
    </Row>
</>
    )
}

export default Publication;