import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Lock, User, Github } from 'lucide-react';
import './Auth.css';

const Auth = ({ initialMode = 'login', onBack }) => {
    const [mode, setMode] = useState(initialMode);

    // Sync external mode changes if they occur
    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);

    const toggleMode = () => {
        setMode(mode === 'login' ? 'signup' : 'login');
    };

    return (
        <div className="auth-wrapper">
            <button className="auth-back-btn" onClick={onBack}>
                <ArrowLeft size={18} />
                <span>Back to Home</span>
            </button>

            <div className="auth-card-container">
                {/* Decorative background blur within the card area */}
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

                    <form className="auth-form" onSubmit={(e) => { e.preventDefault(); onBack(); }}>

                        {mode === 'signup' && (
                            <div className="input-group">
                                <label>Full Name</label>
                                <div className="input-wrapper">
                                    <User size={18} className="input-icon" />
                                    <input type="text" placeholder="John Doe" required />
                                </div>
                            </div>
                        )}

                        <div className="input-group">
                            <label>Email Address</label>
                            <div className="input-wrapper">
                                <Mail size={18} className="input-icon" />
                                <input type="email" placeholder="you@example.com" required />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} className="input-icon" />
                                <input type="password" placeholder="••••••••" required />
                            </div>
                            {mode === 'login' && (
                                <a href="#" className="forgot-password">Forgot password?</a>
                            )}
                        </div>

                        <button type="submit" className="btn-auth-submit">
                            {mode === 'login' ? 'Log in' : 'Sign up'}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>or continue with</span>
                    </div>

                    <div className="social-auth">
                        <button className="btn-social google">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>
                        <button className="btn-social github">
                            <Github size={18} />
                            GitHub
                        </button>
                    </div>

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
