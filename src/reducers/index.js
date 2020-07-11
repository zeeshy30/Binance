import { combineReducers } from "redux";
import authReducer from "./Auth";
import errorReducer from "./Errors";

export default combineReducers({
    auth: authReducer,
    errors: errorReducer
});