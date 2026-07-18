import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api'; // Tumhara axios instance jo humne pehle set kiya tha

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Naya: loading state for better UX
    
    const navigate = useNavigate();
    const { login } = useContext(AuthContext); // AuthProvider se login function call karenge

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            // API instance use karo
            const res = await API.post('/auth/login', { email, password });

            // AuthContext ka login function call karo (ye localStorage aur state dono update karega)
            login(res.data.user, res.data.token);

            // Redirect based on role
            if (res.data.user.role === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/manager-dashboard');
            }
            
        } catch (err) {
            setError(err.response?.data?.message || "Invalid Email or Password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #e2e8f0", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
            <h2 style={{ textAlign: "center", color: "#1e3a8a" }}>Login</h2>
            {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
            
            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: "15px" }}>
                    <label>Email:</label>
                    <input 
                        type="email" 
                        style={{ width: "100%", padding: "10px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <div style={{ marginBottom: "15px" }}>
                    <label>Password:</label>
                    <input 
                        type="password" 
                        style={{ width: "100%", padding: "10px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ width: "100%", padding: "10px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
};

export default Login;