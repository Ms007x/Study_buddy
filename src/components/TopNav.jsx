import { useState, useEffect, useRef } from 'react';
import { GraduationCap, ChevronDown, User, LogOut, Settings, Menu, X } from 'lucide-react';
import './TopNav.css';

const TopNav = ({ isAuthenticated, onLogout, onHome, onLogin, onSignup, onProfile }) => {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);
    const mobileMenuRef = useRef(null);

    // Close profile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const handleHomeClick = (e) => {
        e.preventDefault();
        if (onHome) onHome();

        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    };

    const handleScrollNav = (e, targetId) => {
        e.preventDefault();
        if (onHome) onHome();

        setTimeout(() => {
            if (targetId === 'bottom') {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            } else {
                const element = document.getElementById(targetId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }, 100);
    };

    return (
        <nav className="top-nav">
            <div className="nav-logo" onClick={handleHomeClick} style={{ cursor: 'pointer' }}>
                <div className="logo-icon-wrapper">
                    <GraduationCap size={18} strokeWidth={2.5} />
                </div>
                <span className="logo-text">STUDYBUDDY</span>
            </div>

            {/* Mobile Menu Button */}
            <button 
                className="mobile-menu-btn" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="nav-links">
                <a href="#" className="nav-link" onClick={handleHomeClick}>HOME</a>
                <a href="#courses" className="nav-link with-dropdown" onClick={(e) => handleScrollNav(e, 'courses')}>
                    COURSES <ChevronDown size={14} />
                </a>
                <a href="#contact" className="nav-link" onClick={(e) => handleScrollNav(e, 'contact')}>CONTACT</a>
            </div>

            <div className="nav-auth">
                {isAuthenticated ? (
                    <div className="profile-dropdown" style={{ position: 'relative' }} ref={profileMenuRef}>
                        <button 
                            className="profile-btn" 
                            title="Profile"
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        >
                            <User size={18} />
                        </button>
                        {isProfileMenuOpen && (
                            <div className="profile-menu" style={{
                                position: 'absolute',
                                right: 0,
                                top: '100%',
                                background: 'white',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                zIndex: 10,
                                overflow: 'hidden',
                                minWidth: '150px',
                                marginTop: '0.5rem'
                            }}>
                                <button 
                                    className="profile-menu-item"
                                    onClick={() => {
                                        onProfile();
                                        setIsProfileMenuOpen(false);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        color: 'var(--text-dark-navy)'
                                    }}
                                >
                                    <User size={14} />
                                    Profile
                                </button>
                                <button 
                                    className="profile-menu-item"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        color: 'var(--text-dark-navy)'
                                    }}
                                >
                                    <Settings size={14} />
                                    Settings
                                </button>
                                <button 
                                    className="profile-menu-item"
                                    onClick={() => {
                                        onLogout();
                                        setIsProfileMenuOpen(false);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        color: '#e11d48',
                                        borderTop: '1px solid #f1f5f9'
                                    }}
                                >
                                    <LogOut size={14} />
                                    Log out
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <button className="auth-login" onClick={onLogin}>Log in</button>
                        <button className="auth-signup" onClick={onSignup}>Sign up</button>
                    </>
                )}
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="mobile-menu-overlay" ref={mobileMenuRef}>
                    <div className="mobile-menu-content">
                        <div className="mobile-menu-header">
                            <div className="nav-logo" onClick={handleHomeClick} style={{ cursor: 'pointer' }}>
                                <div className="logo-icon-wrapper">
                                    <GraduationCap size={18} strokeWidth={2.5} />
                                </div>
                                <span className="logo-text">STUDYBUDDY</span>
                            </div>
                            <button 
                                className="mobile-menu-close" 
                                onClick={() => setIsMobileMenuOpen(false)}
                                aria-label="Close mobile menu"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="mobile-menu-links">
                            <a href="#" className="mobile-nav-link" onClick={(e) => { handleHomeClick(e); setIsMobileMenuOpen(false); }}>HOME</a>
                            <a href="#courses" className="mobile-nav-link" onClick={(e) => { handleScrollNav(e, 'courses'); setIsMobileMenuOpen(false); }}>
                                COURSES
                            </a>
                            <a href="#contact" className="mobile-nav-link" onClick={(e) => { handleScrollNav(e, 'contact'); setIsMobileMenuOpen(false); }}>
                                CONTACT
                            </a>
                        </div>

                        <div className="mobile-menu-auth">
                            {isAuthenticated ? (
                                <div className="mobile-profile-section">
                                    <div className="mobile-profile-header">
                                        <User size={20} />
                                        <span>Account</span>
                                    </div>
                                    <div className="mobile-profile-links">
                                        <button 
                                            className="mobile-nav-link"
                                            onClick={() => { onProfile(); setIsMobileMenuOpen(false); }}
                                        >
                                            <User size={16} /> Profile
                                        </button>
                                        <button 
                                            className="mobile-nav-link"
                                            onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                                        >
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="mobile-auth-buttons">
                                    <button className="mobile-auth-login" onClick={() => { onLogin(); setIsMobileMenuOpen(false); }}>Log in</button>
                                    <button className="mobile-auth-signup" onClick={() => { onSignup(); setIsMobileMenuOpen(false); }}>Sign up</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default TopNav;
