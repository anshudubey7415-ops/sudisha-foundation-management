import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/login" />; // Agar login nahi, toh login bhejo
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <div>Access Denied!</div>; // Agar role match nahi kiya
    }

    return children;
};

export default ProtectedRoute;