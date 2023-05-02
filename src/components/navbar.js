import {Navbar, Nav} from 'react-bootstrap'
import React from 'react';
import './components.css'

function NavBar(){
    return(
<>
<Navbar className='nav-center' collapseOnSelect expand="lg" sticky='top' variant="dark">
  <Navbar.Toggle aria-controls="responsive-navbar-nav" />
  <Navbar.Collapse id="responsive-navbar-nav">
  <Nav className="justify-content-center m-auto" activeKey="/home">
      <Nav.Link href="#about">About Me</Nav.Link>
      <Nav.Link href="#publications">Publications</Nav.Link>
      <Nav.Link href="#cv">CV</Nav.Link>
  </Nav>
  </Navbar.Collapse>
</Navbar>
</>
    )
}


export default NavBar;
