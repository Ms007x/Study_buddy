import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, FileText, ChevronRight, ChevronDown, Clock, Plus, BookOpen, PenTool, CheckCircle2, Sparkles, Mic, Save, X } from 'lucide-react';
import './CourseDetails.css';

const initialNotes = [
    {
        id: 1,
        title: "Lecture 4: Architecture Overview",
        meta: "Created 2 days ago • 1.2k words",
        content: "The fundamental architecture consists of a client layer, a business logic layer, and a data access layer. Communication between the layers happens via RESTful APIs and asynchronous message queues to ensure high availability."
    },
    {
        id: 2,
        title: "Chapter 2 Reading Summary",
        meta: "Created 4 days ago • 800 words",
        content: "Chapter 2 covers the basics of memory management, outlining paging and segmentation strategies. It also highlights the trade-offs between internal and external fragmentation."
    },
    {
        id: 3,
        title: "Midterm Study Guide Draft",
        meta: "Created 1 week ago • 2.5k words",
        content: "Topics to cover: 1. Process scheduling algorithms (RR, SJF, FCFS). 2. Deadlock avoidance (Banker's Algorithm). 3. Virtual memory implementation details."
    }
];

const CourseDetails = ({ course, onBack }) => {
    const [notes, setNotes] = useState(initialNotes);
    const [expandedNote, setExpandedNote] = useState(null);
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [newNoteContent, setNewNoteContent] = useState('');
    const [summarizedNotes, setSummarizedNotes] = useState({});

    const toggleNote = (id) => {
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

        setNotes([newNote, ...notes]);
        setNewNoteTitle('');
        setNewNoteContent('');
        setIsAddingNote(false);
        setExpandedNote(newNote.id);
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
                                <div key={note.id} className={`note-list-container ${expandedNote === note.id ? 'expanded' : ''}`}>
                                    <div className="note-list-item" onClick={() => toggleNote(note.id)}>
                                        <div className="note-icon"><FileText size={18} /></div>
                                        <div className="note-info">
                                            <h4 className="note-title">{note.title}</h4>
                                            <p className="note-meta">{note.meta}</p>
                                        </div>
                                        <button className={`arrow-btn ${expandedNote === note.id ? 'active' : ''}`}>
                                            {expandedNote === note.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                        </button>
                                    </div>

                                    {expandedNote === note.id && (
                                        <div className="note-expanded-content">
                                            <div className="note-body markdown-rendered-content">
                                                <ReactMarkdown>{note.content}</ReactMarkdown>
                                            </div>
                                            <div className="note-actions">
                                                <button
                                                    className="btn-summarize-ai-small"
                                                    onClick={() => handleSummarizeNote(note.id, note.content)}
                                                >
                                                    <Sparkles size={14} style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                                                    {summarizedNotes[note.id] && !summarizedNotes[note.id].loading ? 'Hide Summary' : 'Summarize with AI'}
                                                </button>
                                            </div>

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
