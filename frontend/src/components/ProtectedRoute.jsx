import { useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role?.toLowerCase())) {
        const role = user.role?.toLowerCase();
        const dashboardRoute = role === 'admin' 
            ? '/admin-dashboard' 
            : role === 'intern' 
            ? '/intern-portal' 
            : '/manager-dashboard';
        return (
            <div style={{ maxWidth: "500px", margin: "60px auto", padding: "36px 30px", textAlign: "center" }} className="card">
                <div style={{ display: "inline-flex", padding: "16px", background: "var(--danger-bg)", color: "var(--danger)", borderRadius: "50%", marginBottom: "16px" }}>
                    <ShieldAlert size={40} />
                </div>
                <h2>Access Restricted</h2>
                <p style={{ marginTop: "8px", marginBottom: "24px", color: "var(--text-muted)" }}>
                    Your account role (<strong className={`badge badge-role-${user.role}`}>{user.role}</strong>) does not have permission to view this page.
                </p>
                <Link to={dashboardRoute} className="btn btn-primary">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;