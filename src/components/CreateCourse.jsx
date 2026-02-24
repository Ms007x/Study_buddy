import { useState } from 'react';
import { ArrowLeft, Plus, BookOpen, ChevronRight } from 'lucide-react';
import './CreateCourse.css';

const CreateCourse = ({ onBack, onCreate, editMode = false, initialData = null }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [theme, setTheme] = useState(initialData?.colorClass || 'theme-blue');

    // Dynamic Learning Path
    const [learningPath, setLearningPath] = useState(
        initialData?.learningPath?.length > 0
            ? initialData.learningPath
            : [{ id: 1, day: 'Day 1', topic: '' }]
    );

    // Initial Notes Text
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');

    const addDay = () => {
        setLearningPath(prev => [
            ...prev,
            { id: Date.now(), day: `Day ${prev.length + 1}`, topic: '' }
        ]);
    };

    const updateDayTopic = (id, val) => {
        setLearningPath(prev => prev.map(p => p.id === id ? { ...p, topic: val } : p));
    };

    const handleCreate = () => {
        if (!title.trim() || !description.trim()) return;

        // Build initial notes array if user typed a note
        const initialNotes = noteTitle.trim() && noteContent.trim()
            ? [{ id: Date.now(), title: noteTitle.trim(), content: noteContent.trim() }]
            : [];

        onCreate({
            id: Date.now(),
            title,
            description,
            timeAgo: 'Just now',
            colorClass: theme,
            notes: initialNotes,
            learningPath: learningPath.filter(lp => lp.topic.trim() !== '')
        });
    };

    return (
        <div className="create-course-wrapper">
            {/* Top Navigation */}
            <div className="course-nav-bar">
                <button className="back-btn" onClick={onBack}>
                    <ArrowLeft size={18} />
                    <span>Back to Dashboard</span>
                </button>
                <div className="breadcrumbs">
                    <span>Courses</span>
                    <ChevronRight size={14} className="separator" />
                    <span className="current">{editMode ? 'Edit Course' : 'Create New Course'}</span>
                </div>
            </div>

            <div className="create-course-container">
                <div className="create-header">
                    <h1 className="create-title">{editMode ? 'Edit Your Course' : 'Create a Learning Journey'}</h1>
                    <p className="create-subtitle">{editMode ? 'Update your course details and study plan.' : 'Define your goals, structure your daily path, and upload your raw course materials.'}</p>
                </div>

                <div className="create-grid">
                    {/* Left Column: Basic Details & Uploads */}
                    <div className="create-main-column">
                        <section className="create-section">
                            <h2 className="section-title">Course Details</h2>
                            <div className="form-group">
                                <label>Course Title</label>
                                <input
                                    type="text"
                                    className="study-input"
                                    placeholder="e.g. Advanced Machine Learning"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="study-input"
                                    rows="3"
                                    placeholder="Briefly describe what this course is about..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Theme Color</label>
                                <div className="theme-selector">
                                    <button className={`theme-circle theme-blue ${theme === 'theme-blue' ? 'selected' : ''}`} onClick={() => setTheme('theme-blue')}></button>
                                    <button className={`theme-circle theme-purple ${theme === 'theme-purple' ? 'selected' : ''}`} onClick={() => setTheme('theme-purple')}></button>
                                    <button className={`theme-circle theme-magenta ${theme === 'theme-magenta' ? 'selected' : ''}`} onClick={() => setTheme('theme-magenta')}></button>
                                    <button className={`theme-circle theme-teal ${theme === 'theme-teal' ? 'selected' : ''}`} onClick={() => setTheme('theme-teal')}></button>
                                </div>
                            </div>
                        </section>

                        <section className="create-section">
                            <h2 className="section-title">Add an Initial Note (Optional)</h2>
                            <p className="section-subtitle">Write a starting note for this course — supports Markdown formatting.</p>

                            <div className="form-group">
                                <label>Note Title</label>
                                <input
                                    type="text"
                                    className="study-input"
                                    placeholder="e.g. Introduction & Overview"
                                    value={noteTitle}
                                    onChange={e => setNoteTitle(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Note Content <span style={{ fontWeight: 400, color: 'var(--text-blue-gray)' }}>(Markdown supported)</span></label>
                                <textarea
                                    className="study-input"
                                    rows="8"
                                    placeholder={`# My First Note\n\nWrite your notes here. You can use **bold**, *italic*, ## headings, and more.`}
                                    value={noteContent}
                                    onChange={e => setNoteContent(e.target.value)}
                                />
                            </div>
                        </section>

                    </div>

                    {/* Right Column: Study Plan */}
                    <div className="create-side-column">
                        <section className="create-section study-plan-section">
                            <h2 className="section-title">Daily Learning Path</h2>
                            <p className="section-subtitle">Structure your study plan day by day.</p>

                            <div className="learning-path-builder">
                                {learningPath.map((item) => (
                                    <div key={item.id} className="path-item">
                                        <div className="path-dot"><BookOpen size={14} /></div>
                                        <div className="path-content-input">
                                            <span className="path-day-label">{item.day}</span>
                                            <input
                                                type="text"
                                                className="study-input path-input"
                                                placeholder="e.g. Intro & Overview"
                                                value={item.topic}
                                                onChange={(e) => updateDayTopic(item.id, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="add-day-btn" onClick={addDay}>
                                <Plus size={16} /> Add Another Day
                            </button>
                        </section>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="create-footer">
                    <button className="cancel-course-btn" onClick={onBack}>Cancel</button>
                    <button className="save-course-btn" onClick={handleCreate} disabled={!title.trim() || !description.trim()}>
                        {editMode ? 'Update Course' : 'Create Course'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateCourse;
