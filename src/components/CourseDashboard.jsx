import { MoreVertical, Search, Bell, Plus, FileText, Clock } from 'lucide-react';
import './CourseDashboard.css';

const CourseCard = ({ title, notesCount, timeAgo }) => {
    return (
        <div className="course-card">
            <div className="card-header">
                <h3 className="card-title">{title}</h3>
                <button className="card-menu-btn" aria-label="Course options">
                    <MoreVertical size={16} />
                </button>
            </div>

            <div className="card-spacer"></div>

            <div className="card-footer">
                <div className="meta-item">
                    <FileText size={14} className="meta-icon" />
                    <span>{notesCount} Notes</span>
                </div>
                <div className="meta-item">
                    <Clock size={14} className="meta-icon" />
                    <span>{timeAgo}</span>
                </div>
            </div>
        </div>
    );
};

const CourseDashboard = () => {
    return (
        <div className="dashboard-container">
            {/* Breadcrumbs */}
            <div className="breadcrumbs">
                <span>Dashboard</span>
                <span className="separator">/</span>
                <span className="current">Courses</span>
            </div>

            {/* Header Area */}
            <div className="dashboard-header">
                <h2 className="dashboard-title">Courses</h2>
            </div>

            {/* Course Grid */}
            <div className="course-grid">
                <CourseCard
                    title="Operating Systems"
                    notesCount={12}
                    timeAgo="Updated 2h ago"
                />
                <CourseCard
                    title="Database Management"
                    notesCount={28}
                    timeAgo="Updated 1d ago"
                />
                <CourseCard
                    title="UI/UX Design"
                    notesCount={15}
                    timeAgo="Updated 3d ago"
                />
                <CourseCard
                    title="Algorithms"
                    notesCount={42}
                    timeAgo="Updated 5d ago"
                />
            </div>

            {/* Floating Action Button */}
            <button className="fab-button" aria-label="Add new course">
                <Plus size={24} />
            </button>
        </div>
    );
};

export default CourseDashboard;
