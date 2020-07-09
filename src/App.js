import React from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import { Route, Link, BrowserRouter as Router, Switch } from 'react-router-dom'

import Login from './containers/Login';
import Signup from './containers/Signup';
import NotFound from './containers/NotFound';
import Data from './containers/Data';



const App = () => {

    return (
        <Router>
            <div className='App-header'>
                <Switch>
                    <Route exact path="/" component={Login} />
                    <Route exact path="/login" component={Login} />
                    <Route exact path="/signup" component={Signup} />
                    <Route exact path="/home" component={Data} />
                    <Route component={NotFound} />
                </Switch>
            </div>
        </Router>
    );
}

export default App;
