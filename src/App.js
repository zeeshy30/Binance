import React from 'react';
import { Route, BrowserRouter as Router, Switch, Redirect } from 'react-router-dom'
import jwt_decode from "jwt-decode";
import { Provider } from "react-redux";
import { connect } from "react-redux";

import setAuthToken from "./utils/setAuthToken";
import { setCurrentUser, logoutUser } from "./actions/AuthActions";

import store from "./store";
import Login from './containers/Login';
import Signup from './containers/Signup';
import Navbar from './components/Navbar'
import Data from './containers/Data';
import './App.css';

if (localStorage.jwtToken) {
    const token = localStorage.jwtToken;
    setAuthToken(token);
    const decoded = jwt_decode(token);
    store.dispatch(setCurrentUser(decoded));
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
        store.dispatch(logoutUser());
        window.location.href = "./login";
    }
}

const mapStateToProps = state => {
    return state;
};

const Routes = props => {
    const { isAuthenticated } = props.auth;
    return (
        <Router>
            {isAuthenticated && <Navbar dispatch={props.dispatch} logoutUser={logoutUser} />}
            <div className='App-header'>
                <Switch>
                    <Route exact path="/login" component={Login} />
                    <Route exact path="/signup" component={Signup} />
                    <Route exact path="/graph" component={Data} />
                    <Redirect to='/login' />
                </Switch>
            </div>
        </Router>
    )
}

const ConnectedRoutes = connect(mapStateToProps)(Routes);

const App = () => {
    return (
        <Provider store={store}>
            <ConnectedRoutes />
        </Provider>
    );
}

export default App;
