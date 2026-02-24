import { LayoutDashboard, BookOpen, Settings, User, GraduationCap } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon-container">
          <GraduationCap className="logo-icon" size={24} />
        </div>
        <div className="logo-text">
          <h1>StudyBuddy</h1>
        </div>
      </div>

      <nav className="nav-menu">
        <div className="nav-section-label">MENU</div>
        <button className="nav-item">
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>
        <button className="nav-item active">
          <BookOpen size={18} />
          <span>Courses</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <nav className="bottom-menu">
          <div className="nav-section-label">PREFERENCES</div>
          <button className="nav-item">
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button className="nav-item">
            <User size={18} />
            <span>Profile</span>
          </button>
        </nav>

        {/* Sleek User Profile Widget instead of storage */}
        <div className="sidebar-user-widget">
          <img
            src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex&mouth=smile"
            alt="Alex Rivera"
            className="widget-avatar"
          />
          <div className="widget-info">
            <span className="widget-name">Alex Rivera</span>
            <span className="widget-role">Pro Member</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
