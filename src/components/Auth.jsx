import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth as authApi } from '../services/api';
import './Auth.css';

const Auth = ({ initialMode = 'login', onBack, onLoginSuccess }) => {
    const { login, signUp } = useAuth();
    const [mode, setMode] = useState(initialMode);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    useEffect(() => { setMode(initialMode); }, [initialMode]);

    const toggleMode = () => {
        setMode(mode === 'login' ? 'signup' : 'login');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                await signUp(email, password, fullName);
            }
            if (onLoginSuccess) onLoginSuccess();
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <button className="auth-back-btn" onClick={onBack}>
                <ArrowLeft size={18} />
                <span>Back to Home</span>
            </button>

            <div className="auth-card-container">
                <div className="auth-bg-glow"></div>

                <div className="auth-card-inner">
                    <div className="auth-header">
                        <h2>{mode === 'login' ? 'Welcome back' : 'Create an account'}</h2>
                        <p>
                            {mode === 'login'
                                ? 'Enter your details to access your learning dashboard.'
                                : 'Join StudyBuddy to seamlessly manage your learning journey.'}
                        </p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {mode === 'signup' && (
                            <div className="input-group">
                                <label>Full Name</label>
                                <div className="input-wrapper">
                                    <User size={18} className="input-icon" />
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="input-group">
                            <label>Email Address</label>
                            <div className="input-wrapper">
                                <Mail size={18} className="input-icon" />
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {mode === 'login' && <a href="#" className="forgot-password">Forgot password?</a>}
                        </div>

                        <button type="submit" className="btn-auth-submit" disabled={loading}>
                            {loading
                                ? <><Loader2 size={16} className="spinning" /> {mode === 'login' ? 'Logging in…' : 'Creating account…'}</>
                                : (mode === 'login' ? 'Log in' : 'Sign up')}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                            <button className="auth-toggle-btn" onClick={toggleMode}>
                                {mode === 'login' ? 'Sign up for free' : 'Log in here'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
