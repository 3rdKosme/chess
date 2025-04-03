import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const PrivateRoute = ({children}) => {
    const { user, loading } = useContext(AuthContext);

    console.log("Checking user authentication. User: ", user);

    if(loading){
        return <p>Loading...</p>;
    }

    if(!user) {
        console.log("redirecting to /login because user is not logged in.");
        return <Navigate to="/login" />;
    }

    return children;
};

export default PrivateRoute;