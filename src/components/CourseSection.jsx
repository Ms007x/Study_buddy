import { useState } from 'react';
import { MoreVertical, FileText, Clock, ChevronRight, Edit2, Trash2, Plus, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { courses as coursesApi } from '../services/api';
import './CourseSection.css';

const CourseCard = ({ course, onDelete, onGoToCourse, onGoToEditCourse, currentUserId }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isOwner = course.owner_id === currentUserId;

    return (
        <div className={`standalone-course-card ${course.colorClass}`}>
            <div className="course-card-bg-glow"></div>

            <div className="course-card-content">
                <div className="card-top-row">
                    <div className="course-icon-container">
                        <span className="course-icon-initial">{course.title.charAt(0)}</span>
                    </div>

                    {isOwner && (
                        <div style={{ position: 'relative' }}>
                            <button className="context-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                <MoreVertical size={18} />
                            </button>
                            {isMenuOpen && (
                                <div style={{ position: 'absolute', right: 0, top: '100%', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, overflow: 'hidden', minWidth: '120px' }}>
                                    <button onClick={() => { onGoToEditCourse(course); setIsMenuOpen(false); }} style={{ width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-dark-navy)' }}>
                                        <Edit2 size={14} /> Edit
                                    </button>
                                    <button onClick={() => { onDelete(course.id); setIsMenuOpen(false); }} style={{ width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9rem', color: '#e11d48', borderTop: '1px solid #f1f5f9' }}>
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <h3 className="course-card-title">{course.title}</h3>
                <p className="course-card-desc">{course.description}</p>

                <div className="course-card-meta">
                    <div className="meta-pill">
                        <FileText size={12} />
                        {course.notesCount || 0} notes
                    </div>
                    <div className="meta-pill">
                        <Clock size={12} />
                        {course.timeAgo}
                    </div>
                </div>

                <button className="enter-course-btn" onClick={() => onGoToCourse(course)}>
                    Go to Course <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

const CourseSection = ({ courses = [], setCourses, onGoToCourse, onGoToCreateCourse, onGoToEditCourse, isAuthenticated, onLoginRequired }) => {
    const { user } = useAuth();

    const handleDeleteCourse = async (id) => {
        if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            return;
        }

        try {
            // Call API to delete course
            await coursesApi.remove(id);
            
            // Remove from local state
            if (setCourses) {
                setCourses(courses.filter(c => c.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete course:', error);
            alert('Failed to delete course. Please try again.');
        }
    };

    const handleAddCourseClick = () => {
        if (isAuthenticated) {
            onGoToCreateCourse();
        } else {
            onLoginRequired();
        }
    };

    return (
        <section id="courses" className="course-section-container">
            <div className="course-section-header">
                <h2 className="section-title">Courses</h2>
                {isAuthenticated && (
                    <button className="view-all-btn" onClick={handleAddCourseClick} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--accent-blue)', color: 'white' }}>
                        <Plus size={16} /> Add Course
                    </button>
                )}
            </div>

            <div className="course-cards-grid">
                {courses.map(course => (
                    <CourseCard
                        key={course.id}
                        course={course}
                        onDelete={handleDeleteCourse}
                        onGoToCourse={onGoToCourse}
                        onGoToEditCourse={onGoToEditCourse}
                        currentUserId={user?.id}
                    />
                ))}
            </div>
        </section>
    );
};

export default CourseSection;
