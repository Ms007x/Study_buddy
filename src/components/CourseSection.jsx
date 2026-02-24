import { MoreVertical, FileText, Clock, ChevronRight } from 'lucide-react';
import './CourseSection.css';

const CourseCard = ({ title, description, notesCount, timeAgo, colorClass, onGoToCourse }) => {
    const courseData = { title, description, notesCount, timeAgo, colorClass };
    return (
        <div className={`standalone-course-card ${colorClass}`}>
            <div className="course-card-bg-glow"></div>

            <div className="course-card-content">
                <div className="card-top-row">
                    <div className="course-icon-container">
                        <span className="course-icon-initial">{title.charAt(0)}</span>
                    </div>
                    <button className="context-menu-btn">
                        <MoreVertical size={18} />
                    </button>
                </div>

                <h3 className="course-card-title">{title}</h3>
                <p className="course-card-desc">{description}</p>

                <div className="course-card-meta">
                    <div className="meta-pill">
                        <FileText size={12} />
                        <span>{notesCount} Notes</span>
                    </div>
                    <div className="meta-pill">
                        <Clock size={12} />
                        <span>{timeAgo}</span>
                    </div>
                </div>

                <button className="enter-course-btn" onClick={() => onGoToCourse(courseData)}>
                    Go to Course <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

const CourseSection = ({ onGoToCourse }) => {
    return (
        <section className="course-section-container">
            <div className="course-section-header">
                <h2 className="section-title">Your Learning Journeys</h2>
                <button className="view-all-btn">View All</button>
            </div>

            <div className="course-cards-grid">
                <CourseCard
                    title="Operating Systems"
                    description="Memory management, concurrency, and file systems."
                    notesCount={12}
                    timeAgo="Updated 2h ago"
                    colorClass="theme-blue"
                    onGoToCourse={onGoToCourse}
                />
                <CourseCard
                    title="Database Management"
                    description="SQL, relational algebra, and normalization."
                    notesCount={28}
                    timeAgo="Updated 1d ago"
                    colorClass="theme-purple"
                    onGoToCourse={onGoToCourse}
                />
                <CourseCard
                    title="UI/UX Design"
                    description="Principles of effective human-computer interaction."
                    notesCount={15}
                    timeAgo="Updated 3d ago"
                    colorClass="theme-magenta"
                    onGoToCourse={onGoToCourse}
                />
                <CourseCard
                    title="Algorithms"
                    description="Graph algorithms, dynamic programming, and sorting."
                    notesCount={42}
                    timeAgo="Updated 5d ago"
                    colorClass="theme-teal"
                    onGoToCourse={onGoToCourse}
                />
            </div>
        </section>
    );
};

export default CourseSection;
