import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../api';
import { 
    AlertTriangle, 
    Mail, 
    Eye, 
    EyeOff, 
    ArrowRight, 
    Loader2, 
    KeyRound, 
    ShieldCheck, 
    CheckCircle2, 
    X, 
    Sparkles, 
} from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Forgot Password Flow States
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotStep, setForgotStep] = useState('email'); // 'email' | 'admin_otp' | 'request_sent'
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotOtp, setForgotOtp] = useState('');
    const [forgotNewPass, setForgotNewPass] = useState('');
    const [forgotConfirmPass, setForgotConfirmPass] = useState('');
    const [showForgotNewPass, setShowForgotNewPass] = useState(false);
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotRole, setForgotRole] = useState('');

    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const { showSuccess, showError, showWarning } = useToast();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const res = await API.post('/auth/login', { email: email.trim(), password });
            login(res.data.user, res.data.token);
            showSuccess(`Welcome back, ${res.data.user.name || 'User'}!`);

            const role = res.data.user.role?.toLowerCase();
            if (role === 'admin') {
                navigate('/admin-dashboard');
            } else if (role === 'intern') {
                navigate('/intern-portal');
            } else {
                navigate('/manager-dashboard');
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Invalid Email or Password";
            setError(msg);
            showError(msg);
        } finally {
            setLoading(false);
        }
    };

    const openForgotPasswordModal = () => {
        setForgotEmail(email.trim() || '');
        setForgotOtp('');
        setForgotNewPass('');
        setForgotConfirmPass('');
        setForgotStep('email');
        setShowForgotModal(true);
    };

    const handleForgotEmailSubmit = async (e) => {
        e.preventDefault();
        if (!forgotEmail.trim()) {
            showWarning("Please enter your registered email address.");
            return;
        }

        try {
            setForgotLoading(true);
            const res = await API.post('/auth/forgot-password', { email: forgotEmail.trim() });
            
            const role = (res.data.role || '').toLowerCase();
            setForgotRole(role);

            if (role === 'admin') {
                setForgotStep('admin_otp');
                showSuccess("OTP code sent to your registered Admin email!");
            } else {
                setForgotStep('request_sent');
                showSuccess("Password reset request sent to Admin successfully!");
            }
        } catch (err) {
            console.error("Forgot password error:", err);
            showError(err.response?.data?.message || "Failed to process request. Please check email address.");
        } finally {
            setForgotLoading(false);
        }
    };

    const handleAdminOtpResetSubmit = async (e) => {
        e.preventDefault();
        if (!forgotOtp.trim() || forgotOtp.trim().length !== 6) {
            showWarning("Please enter the 6-digit OTP code sent to your email.");
            return;
        }

        if (!forgotNewPass || forgotNewPass.length < 6) {
            showWarning("New password must be at least 6 characters long.");
            return;
        }

        if (forgotNewPass !== forgotConfirmPass) {
            showWarning("Passwords do not match. Please re-enter.");
            return;
        }

        try {
            setForgotLoading(true);
            const res = await API.post('/auth/reset-password-otp', {
                email: forgotEmail.trim(),
                otp: forgotOtp.trim(),
                newPassword: forgotNewPass.trim()
            });

            showSuccess(res.data?.message || "Admin password reset successfully! You can now sign in.");
            setShowForgotModal(false);
            setEmail(forgotEmail.trim());
            setPassword('');
        } catch (err) {
            console.error("OTP Reset error:", err);
            showError(err.response?.data?.message || "Failed to reset password with OTP.");
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "radial-gradient(circle at 50% 20%, rgba(37, 99, 235, 0.12) 0%, rgba(15, 23, 42, 0.02) 60%), var(--bg-page)",
        }}>
            <div style={{
                width: "100%",
                maxWidth: "440px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-xl)",
                padding: "36px 32px",
                position: "relative",
                overflow: "hidden"
            }}>
                {/* Decorative Top Gradient Stripe */}
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "5px",
                    background: "var(--primary-gradient)"
                }} />

                {/* Logo & Heading */}
                <div style={{ textAlign: "center", marginBottom: "28px" }}>
                    <div style={{
                        width: "60px",
                        height: "60px",
                        margin: "0 auto 14px",
                        borderRadius: "var(--radius-md)",
                        background: "var(--primary-gradient)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "1.75rem",
                        fontWeight: 800,
                        boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)"
                    }}>
                        <img
                            src="/logo.png"
                            alt="Sudisha Foundation logo"
                            style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "inherit" }}
                        />
                    </div>
                    <h1 style={{ fontSize: "1.5rem", margin: "0 0 6px 0" }}>Sudisha Foundation</h1>
                    <p style={{ margin: 0, fontSize: "0.875rem" }}>Sign in to access your management portal</p>
                </div>

                {error && (
                    <div style={{
                        background: "var(--danger-bg)",
                        color: "var(--danger-text)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        padding: "12px 16px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        marginBottom: "20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                    }}>
                        <AlertTriangle size={18} />
                        <span>{error}</span>
                    </div>
                )}
                
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div className="search-input-wrapper" style={{ maxWidth: "100%" }}>
                            <span className="search-icon" style={{ display: "flex", alignItems: "center" }}>
                                <Mail size={16} />
                            </span>
                            <input 
                                type="email"
                                className="form-input"
                                placeholder="name@sudishafoundation.org"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                            <label className="form-label" style={{ margin: 0 }}>Password</label>
                            <button
                                type="button"
                                onClick={openForgotPasswordModal}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "var(--primary)",
                                    fontSize: "0.8125rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    padding: 0,
                                    textDecoration: "underline",
                                    textUnderlineOffset: "3px"
                                }}
                            >
                                Forgot Password?
                            </button>
                        </div>
                        <div style={{ position: "relative" }}>
                            <input 
                                type={showPassword ? "text" : "password"}
                                className="form-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: "absolute",
                                    right: "12px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: "4px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "var(--text-muted)",
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn btn-primary btn-lg"
                        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="spin" />
                                <span>Signing In...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div style={{
                    marginTop: "24px",
                    paddingTop: "18px",
                    borderTop: "1px solid var(--border-color)",
                    textAlign: "center",
                    fontSize: "0.8125rem",
                    color: "var(--text-muted)"
                }}>
                    Sudisha Foundation NGO Portal &copy; {new Date().getFullYear()}
                </div>
            </div>

            {/* FORGOT PASSWORD MODAL */}
            {showForgotModal && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(10, 15, 29, 0.75)",
                    backdropFilter: "blur(6px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    padding: "20px"
                }}>
                    <div className="card" style={{
                        maxWidth: "460px",
                        width: "100%",
                        padding: "32px 28px",
                        position: "relative",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
                    }}>
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setShowForgotModal(false)}
                            style={{
                                position: "absolute",
                                top: "18px",
                                right: "18px",
                                background: "transparent",
                                border: "none",
                                color: "var(--text-muted)",
                                cursor: "pointer",
                                padding: "4px"
                            }}
                        >
                            <X size={20} />
                        </button>

                        {/* STEP 1: Enter Email */}
                        {forgotStep === 'email' && (
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                                    <div style={{
                                        width: "42px",
                                        height: "42px",
                                        borderRadius: "10px",
                                        background: "rgba(37, 99, 235, 0.15)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "var(--primary)"
                                    }}>
                                        <KeyRound size={22} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
                                            Forgot Password?
                                        </h3>
                                        <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-muted)" }}>
                                            Recover your portal access credentials
                                        </p>
                                    </div>
                                </div>

                                <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "20px" }}>
                                    Enter your registered email address. If you are an <strong>Admin</strong>, a 6-digit OTP will be sent. For <strong>Managers &amp; Interns</strong>, a direct request will be submitted to Admin.
                                </p>

                                <form onSubmit={handleForgotEmailSubmit}>
                                    <div className="form-group" style={{ marginBottom: "20px" }}>
                                        <label className="form-label">Registered Email Address</label>
                                        <div className="search-input-wrapper" style={{ maxWidth: "100%" }}>
                                            <span className="search-icon" style={{ display: "flex", alignItems: "center" }}>
                                                <Mail size={16} />
                                            </span>
                                            <input
                                                type="email"
                                                className="form-input"
                                                required
                                                placeholder="your.email@sudishafoundation.org"
                                                value={forgotEmail}
                                                onChange={(e) => setForgotEmail(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setShowForgotModal(false)}
                                            disabled={forgotLoading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={forgotLoading}
                                            style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                                        >
                                            {forgotLoading ? (
                                                <>
                                                    <Loader2 size={16} className="spin" />
                                                    <span>Processing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Continue</span>
                                                    <ArrowRight size={16} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* STEP 2: Admin OTP Verification */}
                        {forgotStep === 'admin_otp' && (
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                                    <div style={{
                                        width: "42px",
                                        height: "42px",
                                        borderRadius: "10px",
                                        background: "rgba(16, 185, 129, 0.15)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#10b981"
                                    }}>
                                        <ShieldCheck size={22} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
                                            Admin OTP Verification
                                        </h3>
                                        <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-muted)" }}>
                                            Enter the code sent to {forgotEmail}
                                        </p>
                                    </div>
                                </div>

                                <div style={{
                                    background: "rgba(37, 99, 235, 0.08)",
                                    border: "1px solid rgba(37, 99, 235, 0.2)",
                                    borderRadius: "var(--radius-sm)",
                                    padding: "12px 14px",
                                    fontSize: "0.85rem",
                                    color: "var(--text-primary)",
                                    marginBottom: "18px"
                                }}>
                                    📩 A 6-digit verification code has been dispatched to <strong>{forgotEmail}</strong>. (Valid for 10 minutes)
                                </div>

                                <form onSubmit={handleAdminOtpResetSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    <div className="form-group">
                                        <label className="form-label">6-Digit Verification OTP *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            maxLength={6}
                                            placeholder="e.g. 849201"
                                            value={forgotOtp}
                                            onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                                            style={{
                                                fontSize: "1.3rem",
                                                fontWeight: 800,
                                                letterSpacing: "6px",
                                                textAlign: "center",
                                                fontFamily: "monospace"
                                            }}
                                            autoFocus
                                        />
                                    </div>

                                    <div className="form-group">
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                            <label className="form-label" style={{ margin: 0 }}>New Admin Password *</label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$";
                                                    let pass = "Admin@";
                                                    for (let i = 0; i < 6; i++) {
                                                        pass += chars.charAt(Math.floor(Math.random() * chars.length));
                                                    }
                                                    setForgotNewPass(pass);
                                                    setForgotConfirmPass(pass);
                                                }}
                                                className="btn btn-secondary btn-sm"
                                                style={{ fontSize: "0.72rem", padding: "1px 6px" }}
                                            >
                                                Auto-Generate
                                            </button>
                                        </div>
                                        <div style={{ position: "relative" }}>
                                            <input
                                                type={showForgotNewPass ? "text" : "password"}
                                                className="form-control"
                                                required
                                                minLength={6}
                                                placeholder="Enter new password (min 6 chars)"
                                                value={forgotNewPass}
                                                onChange={(e) => setForgotNewPass(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowForgotNewPass(!showForgotNewPass)}
                                                style={{
                                                    position: "absolute",
                                                    right: "10px",
                                                    top: "50%",
                                                    transform: "translateY(-50%)",
                                                    background: "transparent",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    color: "var(--text-muted)",
                                                    padding: "4px"
                                                }}
                                            >
                                                {showForgotNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Confirm New Password *</label>
                                        <input
                                            type={showForgotNewPass ? "text" : "password"}
                                            className="form-control"
                                            required
                                            minLength={6}
                                            placeholder="Re-type new password"
                                            value={forgotConfirmPass}
                                            onChange={(e) => setForgotConfirmPass(e.target.value)}
                                        />
                                    </div>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setForgotStep('email')}
                                            disabled={forgotLoading}
                                        >
                                            Change Email
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={forgotLoading}
                                            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                                        >
                                            {forgotLoading ? <Loader2 size={16} className="spin" /> : <CheckCircle2 size={16} />}
                                            <span>{forgotLoading ? "Resetting..." : "Reset Password"}</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* STEP 3: Manager / Intern Request Confirmation */}
                        {forgotStep === 'request_sent' && (
                            <div style={{ textAlign: "center", padding: "10px 0" }}>
                                <div style={{
                                    width: "60px",
                                    height: "60px",
                                    margin: "0 auto 16px",
                                    borderRadius: "50%",
                                    background: "rgba(16, 185, 129, 0.15)",
                                    border: "2px solid rgba(16, 185, 129, 0.4)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#10b981"
                                }}>
                                    <CheckCircle2 size={32} />
                                </div>

                                <h3 style={{ margin: "0 0 8px 0", fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
                                    Request Sent to Admin!
                                </h3>
                                
                                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "20px" }}>
                                    Your password reset request for <strong style={{ color: "var(--text-primary)" }}>{forgotEmail}</strong> ({forgotRole}) has been forwarded to the <strong>Administrator</strong>.
                                </p>

                                <div style={{
                                    background: "var(--bg-surface)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "var(--radius-md)",
                                    padding: "16px",
                                    textAlign: "left",
                                    fontSize: "0.85rem",
                                    color: "var(--text-muted)",
                                    marginBottom: "24px"
                                }}>
                                    <div style={{ fontWeight: 600, color: "var(--primary)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                                        <Sparkles size={15} /> Next Steps:
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: "18px", lineHeight: 1.6 }}>
                                        <li>Admin will review your request in the Admin Portal.</li>
                                        <li>Admin will set a new password and dispatch it directly to your registered email address.</li>
                                    </ul>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(false)}
                                    className="btn btn-primary"
                                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                                >
                                    <span>Back to Sign In</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;