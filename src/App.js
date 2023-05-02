import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavBar from './components/navbar'
import About from './components/about'
import Publications from './components/publications'
import CV from './components/cv'

function App() {
    return (
        <div className="App">
            <NavBar></NavBar>
            <About id='about'></About>
            <Publications></Publications>
            <CV></CV>

        </div>
    );
}

export default App;
