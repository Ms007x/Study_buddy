import { GraduationCap, ChevronDown, User } from 'lucide-react';
import './TopNav.css';

const TopNav = ({ isAuthenticated, onLogout, onHome, onLogin, onSignup }) => {
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

            <div className="nav-links">
                <a href="#" className="nav-link" onClick={handleHomeClick}>HOME</a>
                <a href="#courses" className="nav-link with-dropdown" onClick={(e) => handleScrollNav(e, 'courses')}>
                    COURSES <ChevronDown size={14} />
                </a>
                <a href="#contact" className="nav-link" onClick={(e) => handleScrollNav(e, 'contact')}>CONTACT</a>
            </div>

            <div className="nav-auth">
                {isAuthenticated ? (
                    <>
                        <button className="auth-login" onClick={onLogout} style={{ marginRight: '0.5rem' }}>Log out</button>
                        <button className="profile-btn">
                            <User size={18} />
                        </button>
                    </>
                ) : (
                    <>
                        <button className="auth-login" onClick={onLogin}>Log in</button>
                        <button className="auth-signup" onClick={onSignup}>Sign up</button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default TopNav;
