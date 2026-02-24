import { useState } from 'react';
import { MoreVertical, FileText, Clock, ChevronRight, Edit2, Trash2, Plus, Save, X } from 'lucide-react';
import './CourseSection.css';

const CourseCard = ({ course, onUpdate, onDelete, onGoToCourse }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(course.title);
    const [editDesc, setEditDesc] = useState(course.description);

    const handleSave = () => {
        onUpdate({ ...course, title: editTitle, description: editDesc });
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className={`standalone-course-card ${course.colorClass}`}>
                <div className="course-card-bg-glow"></div>
                <div className="course-card-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <input
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="study-input"
                        style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.1)', fontSize: '1.1rem', fontWeight: 'bold' }}
                    />
                    <textarea
                        value={editDesc}
                        onChange={e => setEditDesc(e.target.value)}
                        className="study-input"
                        style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.1)', flexGrow: 1, resize: 'none' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                        <button onClick={handleSave} style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', background: 'var(--accent-blue)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}><Save size={14} /> Save</button>
                        <button onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', background: '#ffe4e6', color: '#e11d48', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}><X size={14} /> Cancel</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`standalone-course-card ${course.colorClass}`}>
            <div className="course-card-bg-glow"></div>

            <div className="course-card-content">
                <div className="card-top-row">
                    <div className="course-icon-container">
                        <span className="course-icon-initial">{course.title.charAt(0)}</span>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <button className="context-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <MoreVertical size={18} />
                        </button>
                        {isMenuOpen && (
                            <div style={{ position: 'absolute', right: 0, top: '100%', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, overflow: 'hidden', minWidth: '120px' }}>
                                <button onClick={() => { setIsEditing(true); setIsMenuOpen(false); }} style={{ width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-dark-navy)' }}>
                                    <Edit2 size={14} /> Edit
                                </button>
                                <button onClick={() => { onDelete(course.id); setIsMenuOpen(false); }} style={{ width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9rem', color: '#e11d48', borderTop: '1px solid #f1f5f9' }}>
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <h3 className="course-card-title">{course.title}</h3>
                <p className="course-card-desc">{course.description}</p>

                <div className="course-card-meta">
                    <div className="meta-pill">
                        <FileText size={12} />
                        <span>{course.notes?.length || 0} Notes</span>
                    </div>
                    <div className="meta-pill">
                        <Clock size={12} />
                        <span>{course.timeAgo}</span>
                    </div>
                </div>

                <button className="enter-course-btn" onClick={() => onGoToCourse(course)}>
                    Go to Course <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

const CourseSection = ({ courses = [], setCourses, onGoToCourse, onGoToCreateCourse }) => {
    const handleUpdateCourse = (updatedCourse) => {
        if (setCourses) {
            setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
        }
    };

    const handleDeleteCourse = (id) => {
        if (setCourses) {
            setCourses(courses.filter(c => c.id !== id));
        }
    };

    return (
        <section id="courses" className="course-section-container">
            <div className="course-section-header">
                <h2 className="section-title">Your Learning Journeys</h2>
                <button className="view-all-btn" onClick={onGoToCreateCourse} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--accent-blue)', color: 'white' }}>
                    <Plus size={16} /> Add Course
                </button>
            </div>

            <div className="course-cards-grid">
                {courses.map(course => (
                    <CourseCard
                        key={course.id}
                        course={course}
                        onUpdate={handleUpdateCourse}
                        onDelete={handleDeleteCourse}
                        onGoToCourse={onGoToCourse}
                    />
                ))}
            </div>
        </section>
    );
};

export default CourseSection;
