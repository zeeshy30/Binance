import React from "react";

const Navbar = props => {
    const logout = () => {
        props.dispatch(props.logoutUser())
        window.location.href = "./login";
    };

    return (
        <div className="navbar-fixed">
            <nav className="z-depth-0">
                <button onClick={logout}> Logout</button>
                {/* <div className="nav-wrapper white"> */}
                {/* </div> */}
            </nav>
        </div>
    );
}

export default Navbar;
