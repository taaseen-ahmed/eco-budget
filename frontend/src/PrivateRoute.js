import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element, isAuthenticated }) => {
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    return element;
};

export default PrivateRoute;