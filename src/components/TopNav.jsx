import { GraduationCap, ChevronDown } from 'lucide-react';
import './TopNav.css';

const TopNav = ({ onHome, onLogin, onSignup }) => {
    const handleHomeClick = (e) => {
        e.preventDefault();
        if (onHome) onHome();
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
                <a href="#" className="nav-link with-dropdown" onClick={(e) => e.preventDefault()}>
                    COURSES <ChevronDown size={14} />
                </a>
                <a href="#" className="nav-link" onClick={(e) => e.preventDefault()}>CONTACT</a>
            </div>

            <div className="nav-auth">
                <button className="auth-login" onClick={onLogin}>Log in</button>
                <button className="auth-signup" onClick={onSignup}>Sign up</button>
            </div>
        </nav>
    );
};

export default TopNav;
