import { Search, Bell, Plus } from 'lucide-react';
import './Topbar.css';

const Topbar = () => {
    return (
        <header className="topbar glass-panel">
            <div className="search-container">
                <Search className="search-icon" size={18} />
                <input
                    type="text"
                    placeholder="Search courses, notes, or AI insights..."
                    className="search-input"
                />
                <div className="search-shortcut">⌘K</div>
            </div>

            <div className="topbar-actions">
                <button className="notification-btn">
                    <Bell size={20} />
                    <span className="dot"></span>
                </button>

                <div className="divider"></div>

                <button className="primary-btn">
                    <Plus size={18} />
                    <span>New Course</span>
                </button>
            </div>
        </header>
    );
};

export default Topbar;
