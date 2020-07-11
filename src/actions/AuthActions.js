import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";
import {
    GET_ERRORS,
    SET_CURRENT_USER,
    USER_LOADING,
} from "./Types";
const apiUrl = `http://localhost:3001`;

export const registerUser = (userData, history) => dispatch => {
    axios
        .post(apiUrl + "/api/users/register", userData)
        .then(res => history.push("/login"))
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        );
};

export const loginUser = (userData, history) => dispatch => {
    axios
        .post(apiUrl + "/api/users/login", userData)
        .then(res => {
            console.log('loggin')
            const { token } = res.data;
            localStorage.setItem("jwtToken", token);
            setAuthToken(token);
            const decoded = jwt_decode(token);
            dispatch(setCurrentUser(decoded));
            history.push('graph');

        })
        .catch(err => {
            console.log('error loggin');
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        });
};

export const setCurrentUser = decoded => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded
    };
};

export const setUserLoading = () => {
    return {
        type: USER_LOADING
    };
};

export const logoutUser = () => dispatch => {
    localStorage.removeItem("jwtToken");
    setAuthToken(false);
    dispatch(setCurrentUser({}));
};
