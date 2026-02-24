import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, FileText, ChevronRight, ChevronDown, Clock, Plus, BookOpen, PenTool, CheckCircle2, Sparkles, Mic, Save, X, Edit2, Trash2 } from 'lucide-react';
import './CourseDetails.css';

// initialNotes are now stored inside initialCourses in App.jsx
// The initialNotes array has been removed as per instruction.

const CourseDetails = ({ course, onBack, onUpdateCourse }) => {
    const notes = course?.notes || [];
    const [expandedNote, setExpandedNote] = useState(null);
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [newNoteContent, setNewNoteContent] = useState('');
    const [summarizedNotes, setSummarizedNotes] = useState({});

    // Edit state
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editNoteTitle, setEditNoteTitle] = useState('');
    const [editNoteContent, setEditNoteContent] = useState('');

    const toggleNote = (id) => {
        if (editingNoteId === id) return;
        setExpandedNote(expandedNote === id ? null : id);
    };

    const handleSummarizeNote = (noteId, content) => {
        // Toggle summary off if it already exists
        if (summarizedNotes[noteId] && !summarizedNotes[noteId].loading) {
            const newSummarized = { ...summarizedNotes };
            delete newSummarized[noteId];
            setSummarizedNotes(newSummarized);
            return;
        }

        // Set to loading
        setSummarizedNotes(prev => ({
            ...prev,
            [noteId]: { loading: true, text: '' }
        }));

        // Simulate API call for AI summarization
        setTimeout(() => {
            const summaryText = "Here is a quick AI summary of your notes: " + content.substring(0, 80) + "...";
            setSummarizedNotes(prev => ({
                ...prev,
                [noteId]: { loading: false, text: summaryText }
            }));
        }, 1500);
    };

    const handleSaveNote = () => {
        if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

        const newNote = {
            id: Date.now(),
            title: newNoteTitle,
            meta: `Created just now • ${newNoteContent.trim().split(/\s+/).length} words`,
            content: newNoteContent
        };

        if (onUpdateCourse) {
            onUpdateCourse({ ...course, notes: [newNote, ...notes] });
        }

        setNewNoteTitle('');
        setNewNoteContent('');
        setIsAddingNote(false);
        setExpandedNote(newNote.id);
    };

    const startEditNote = (e, note) => {
        e.stopPropagation();
        setEditingNoteId(note.id);
        setEditNoteTitle(note.title);
        setEditNoteContent(note.content);
        setExpandedNote(note.id);
    };

    const handleSaveEditNote = () => {
        if (!editNoteTitle.trim() || !editNoteContent.trim()) return;
        const updatedNotes = notes.map(n => n.id === editingNoteId ? { ...n, title: editNoteTitle, content: editNoteContent, meta: `Edited just now • ${editNoteContent.trim().split(/\s+/).length} words` } : n);
        if (onUpdateCourse) onUpdateCourse({ ...course, notes: updatedNotes });
        setEditingNoteId(null);
    };

    const handleCancelEdit = () => {
        setEditingNoteId(null);
    };

    const handleDeleteNote = (e, id) => {
        e.stopPropagation();
        const remainingNotes = notes.filter(n => n.id !== id);
        if (onUpdateCourse) onUpdateCourse({ ...course, notes: remainingNotes });
    };

    if (!course) return null;

    return (
        <div className="course-details-wrapper">

            {/* Back Navigation & Breadcrumbs */}
            <div className="course-nav-bar">
                <button className="back-btn" onClick={onBack}>
                    <ArrowLeft size={18} />
                    <span>Back to Dashboard</span>
                </button>
                <div className="breadcrumbs">
                    <span>Courses</span>
                    <ChevronRight size={14} className="separator" />
                    <span className="current">{course.title}</span>
                </div>
            </div>

            {/* Main Course Details Card (Matching EmberIQ panel style) */}
            <div className="course-card-inner">

                {/* Dynamic Course Header */}
                <header className="detail-header">
                    <div className="header-left">
                        <div className={`large-course-icon ${course.colorClass}`}>
                            <span className="icon-text">{course.title.charAt(0)}</span>
                        </div>
                        <div className="header-text">
                            <h1 className="detail-title">{course.title}</h1>
                            <p className="detail-subtitle">{course.description}</p>
                        </div>
                    </div>

                    <div className="header-stats">
                        <div className="stat-pill">
                            <FileText size={14} /> {course.notesCount} Notes
                        </div>
                    </div>
                </header>

                {/* Tab Switcher - Now highlights 'Notes' by default for this view */}
                <div className="detail-tab-switcher">
                    <button className="tab-btn">
                        <span className="tab-icon magenta-gradient"><PenTool size={14} fill="currentColor" /></span> AI Tutor
                    </button>
                    <button className="tab-btn active">Notes</button>
                    <button className="tab-btn">Quizzes</button>
                </div>

                <div className="course-content-grid">
                    {/* Left Column: Timeline / Syllabus */}
                    <div className="course-timeline-section">
                        <h3 className="section-heading">Study Plan</h3>
                        <div className="timeline-container">
                            {course.learningPath && course.learningPath.length > 0 ? (
                                course.learningPath.map((item, index) => (
                                    <div key={item.id || index} className={`timeline-item ${index === 0 ? 'active' : 'pending'}`}>
                                        <div className="timeline-dot">
                                            {index === 0 ? <Clock size={14} /> : <BookOpen size={14} />}
                                        </div>
                                        <div className="timeline-content">
                                            <h4>{item.day}</h4>
                                            <p>{item.topic}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <>
                                    <div className="timeline-item completed">
                                        <div className="timeline-dot"><CheckCircle2 size={14} /></div>
                                        <div className="timeline-content">
                                            <h4>Day 1</h4>
                                            <p>Read Chapters 1-2 & Complete Basics Quiz</p>
                                        </div>
                                    </div>
                                    <div className="timeline-item active">
                                        <div className="timeline-dot"><Clock size={14} /></div>
                                        <div className="timeline-content">
                                            <h4>Day 2</h4>
                                            <p>Review Memory Management Notes & Practice Problems</p>
                                        </div>
                                    </div>
                                    <div className="timeline-item pending">
                                        <div className="timeline-dot"><BookOpen size={14} /></div>
                                        <div className="timeline-content">
                                            <h4>Day 3</h4>
                                            <p>Start Advanced Topics & Prepare for Midterm</p>
                                        </div>
                                    </div>
                                    <div className="timeline-item pending">
                                        <div className="timeline-dot"><BookOpen size={14} /></div>
                                        <div className="timeline-content">
                                            <h4>End of Course</h4>
                                            <p>Final Exam & Project Submission</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Recent Notes */}
                    <div className="course-notes-section">
                        <div className="notes-header-row">
                            <h3 className="section-heading">Recent Notes</h3>
                            <button className="add-note-btn" onClick={() => setIsAddingNote(!isAddingNote)}>
                                {isAddingNote ? <><X size={16} /> Cancel</> : <><Plus size={16} /> New Note</>}
                            </button>
                        </div>

                        {isAddingNote && (
                            <div className="add-note-form">
                                <input
                                    type="text"
                                    placeholder="Note Title"
                                    value={newNoteTitle}
                                    onChange={(e) => setNewNoteTitle(e.target.value)}
                                    className="add-note-title"
                                />
                                <div className="markdown-hint">Supports Markdown formatting (e.g. **bold**, # heading)</div>
                                <textarea
                                    placeholder="Write your note here..."
                                    value={newNoteContent}
                                    onChange={(e) => setNewNoteContent(e.target.value)}
                                    className="study-input add-note-content"
                                    rows={6}
                                />
                                <div className="add-note-actions">
                                    <button className="btn-save-note" onClick={handleSaveNote}>
                                        <Save size={16} /> Save Note
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="notes-list">
                            {notes.map(note => (
                                <div key={note.id} className={`note - list - container ${expandedNote === note.id ? 'expanded' : ''} `}>
                                    <div className="note-list-item" onClick={() => toggleNote(note.id)}>
                                        <div className="note-icon"><FileText size={18} /></div>
                                        <div className="note-info">
                                            <h4 className="note-title">{note.title}</h4>
                                            <p className="note-meta">{note.meta}</p>
                                        </div>
                                        <button className={`arrow - btn ${expandedNote === note.id ? 'active' : ''} `}>
                                            {expandedNote === note.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                        </button>
                                    </div>

                                    {expandedNote === note.id && (
                                        <div className="note-expanded-content">
                                            {editingNoteId === note.id ? (
                                                <div className="add-note-form" style={{ marginTop: '1rem', marginBottom: 0 }}>
                                                    <input
                                                        type="text"
                                                        placeholder="Note Title"
                                                        value={editNoteTitle}
                                                        onChange={(e) => setEditNoteTitle(e.target.value)}
                                                        className="add-note-title"
                                                    />
                                                    <textarea
                                                        placeholder="Write your note here..."
                                                        value={editNoteContent}
                                                        onChange={(e) => setEditNoteContent(e.target.value)}
                                                        className="study-input add-note-content"
                                                        rows={6}
                                                    />
                                                    <div className="add-note-actions" style={{ gap: '0.5rem' }}>
                                                        <button className="btn-save-note" onClick={handleSaveEditNote}>
                                                            <Save size={16} /> Save Changes
                                                        </button>
                                                        <button
                                                            className="btn-save-note"
                                                            style={{ background: '#ffe4e6', color: '#e11d48' }}
                                                            onClick={handleCancelEdit}
                                                        >
                                                            <X size={16} /> Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="note-body markdown-rendered-content">
                                                        <ReactMarkdown>{note.content}</ReactMarkdown>
                                                    </div>
                                                    <div className="note-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button
                                                                className="arrow-btn"
                                                                style={{ padding: '0.4rem', border: '1px solid var(--border-light)' }}
                                                                onClick={(e) => startEditNote(e, note)}
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button
                                                                className="arrow-btn"
                                                                style={{ padding: '0.4rem', border: '1px solid #ffe4e6', color: '#e11d48', background: '#fff1f2' }}
                                                                onClick={(e) => handleDeleteNote(e, note.id)}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                        <button
                                                            className="btn-summarize-ai-small"
                                                            onClick={() => handleSummarizeNote(note.id, note.content)}
                                                        >
                                                            <Sparkles size={14} style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                                                            {summarizedNotes[note.id] && !summarizedNotes[note.id].loading ? 'Hide Summary' : 'Summarize with AI'}
                                                        </button>
                                                    </div>
                                                </>
                                            )}

                                            {summarizedNotes[note.id] && (
                                                <div className="ai-summary-block">
                                                    {summarizedNotes[note.id].loading ? (
                                                        <div className="ai-loading">
                                                            <Sparkles size={14} className="spining-sparkle" />
                                                            <span>Generating summary...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="ai-summary-content">
                                                            <div className="ai-summary-header">
                                                                <Sparkles size={14} />
                                                                <span>AI Summary</span>
                                                            </div>
                                                            <p>{summarizedNotes[note.id].text}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* AI Summarizer Bottom Container */}
                        <div className="detail-ai-summarizer">
                            <h2 className="content-title">What do you want to study?</h2>
                            <p className="content-subtitle">
                                e.g., 'Summarize my {course.title} notes or quiz me.'
                            </p>

                            <div className="input-container">
                                <textarea
                                    className="study-input"
                                    placeholder="Type your question here..."
                                    rows={4}
                                ></textarea>
                                <button className="mic-btn">
                                    <Mic size={16} />
                                </button>
                            </div>

                            <div className="context-tags-section">
                                <span className="tags-label">Context Tags</span>
                                <div className="tags-row">
                                    <button className="tag-pill">Latest Notes</button>
                                    <button className="tag-pill">All Notes</button>
                                    <button className="tag-pill">External Web</button>
                                </div>
                            </div>

                            <button className="btn-generate">
                                <Sparkles size={16} style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                                Generate with AI
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CourseDetails;
