import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import {
    ArrowLeft, FileText, ChevronRight, ChevronDown, Clock, Plus,
    BookOpen, CheckCircle2, Sparkles, Save, X, Edit2,
    Trash2, Bold, Italic, List, Heading, Code, Eye, PenLine
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notes as notesApi } from '../services/api';
import './CourseDetails.css';

// ─── Markdown Toolbar ─────────────────────────────────────────────────────────
const MarkdownToolbar = ({ textareaRef, value, onChange }) => {
    const insert = (before, after = '', placeholder = 'text') => {
        const el = textareaRef.current;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const selected = value.substring(start, end) || placeholder;
        const newVal = value.substring(0, start) + before + selected + after + value.substring(end);
        onChange(newVal);
        // Restore cursor
        setTimeout(() => {
            el.focus();
            const newCursor = start + before.length + selected.length + after.length;
            el.setSelectionRange(newCursor, newCursor);
        }, 0);
    };

    const insertLine = (prefix) => {
        const el = textareaRef.current;
        if (!el) return;
        const start = el.selectionStart;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const newVal = value.substring(0, lineStart) + prefix + value.substring(lineStart);
        onChange(newVal);
        setTimeout(() => {
            el.focus();
            el.setSelectionRange(lineStart + prefix.length, lineStart + prefix.length);
        }, 0);
    };

    const tools = [
        { icon: <Bold size={14} />, label: 'Bold', action: () => insert('**', '**', 'bold text') },
        { icon: <Italic size={14} />, label: 'Italic', action: () => insert('*', '*', 'italic text') },
        { icon: <Heading size={14} />, label: 'Heading', action: () => insertLine('## ') },
        { icon: <List size={14} />, label: 'List', action: () => insertLine('- ') },
        { icon: <Code size={14} />, label: 'Code', action: () => insert('`', '`', 'code') },
    ];

    return (
        <div className="md-toolbar">
            {tools.map(t => (
                <button
                    key={t.label}
                    type="button"
                    className="md-tool-btn"
                    title={t.label}
                    onClick={t.action}
                >
                    {t.icon}
                </button>
            ))}
        </div>
    );
};

// ─── Note Editor (Write + Preview tabs) ──────────────────────────────────────
const NoteEditor = ({ title, content, onTitleChange, onContentChange, onSave, onCancel, saveLabel = 'Save Note', loading = false }) => {
    const [tab, setTab] = useState('write');
    const textareaRef = useRef(null);

    return (
        <div className="note-editor-card">
            <input
                type="text"
                placeholder="Note Title"
                value={title}
                onChange={e => onTitleChange(e.target.value)}
                className="add-note-title"
            />

            {/* Write / Preview Toggle */}
            <div className="editor-tab-row">
                <button
                    type="button"
                    className={`editor-tab-btn ${tab === 'write' ? 'active' : ''}`}
                    onClick={() => setTab('write')}
                >
                    <PenLine size={13} /> Write
                </button>
                <button
                    type="button"
                    className={`editor-tab-btn ${tab === 'preview' ? 'active' : ''}`}
                    onClick={() => setTab('preview')}
                >
                    <Eye size={13} /> Preview
                </button>
            </div>

            {tab === 'write' ? (
                <>
                    <MarkdownToolbar textareaRef={textareaRef} value={content} onChange={onContentChange} />
                    <textarea
                        ref={textareaRef}
                        placeholder={`# Introduction\n\nWrite your notes here...\n- Use **bold**, *italic*\n- Add ## headings\n- Write \`code\``}
                        value={content}
                        onChange={e => onContentChange(e.target.value)}
                        className="study-input add-note-content"
                        rows={8}
                    />
                </>
            ) : (
                <div className="note-preview-box markdown-rendered-content">
                    {content.trim()
                        ? <ReactMarkdown>{content}</ReactMarkdown>
                        : <p style={{ color: 'var(--text-blue-gray)', fontStyle: 'italic' }}>Nothing to preview yet.</p>
                    }
                </div>
            )}

            <div className="add-note-actions">
                <button className="btn-save-note" onClick={onSave} disabled={loading}>
                    <Save size={16} /> {loading ? 'Saving…' : saveLabel}
                </button>
                <button
                    className="btn-save-note"
                    style={{ background: '#f1f5f9', color: 'var(--text-dark-navy)' }}
                    onClick={onCancel}
                >
                    <X size={16} /> Cancel
                </button>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CourseDetails = ({ course, onBack, onUpdateCourse }) => {
    const { isAuthenticated } = useAuth();

    const [notes, setNotes] = useState([]);
    const [notesLoading, setNotesLoading] = useState(false);
    const [expandedNote, setExpandedNote] = useState(null);

    // Add note
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [newNoteContent, setNewNoteContent] = useState('');
    const [saveLoading, setSaveLoading] = useState(false);

    // Edit note
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editNoteTitle, setEditNoteTitle] = useState('');
    const [editNoteContent, setEditNoteContent] = useState('');
    const [editLoading, setEditLoading] = useState(false);

    // AI summarize
    const [summarizedNotes, setSummarizedNotes] = useState({});

    // ── Load notes ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (!course?.id) return;
        setNotesLoading(true);
        notesApi.list(course.id)
            .then(data => {
                const normalized = (Array.isArray(data) ? data : []).map(n => ({
                    ...n,
                    content: n.body || n.content || '',
                    meta: n.updated_at
                        ? `Updated ${timeAgoLabel(n.updated_at)} · ${wordCount(n.body)} words`
                        : `${wordCount(n.body)} words`,
                }));
                setNotes(normalized);
            })
            .catch(err => console.error('Failed to load notes:', err))
            .finally(() => setNotesLoading(false));
    }, [course?.id]);

    const toggleNote = (id) => {
        if (editingNoteId === id) return;
        setExpandedNote(prev => prev === id ? null : id);
    };

    // ── AI Summarize ─────────────────────────────────────────────────────────
    const handleSummarizeNote = async (noteId) => {
        if (summarizedNotes[noteId] && !summarizedNotes[noteId].loading) {
            setSummarizedNotes(prev => { const c = { ...prev }; delete c[noteId]; return c; });
            return;
        }

        setSummarizedNotes(prev => ({ ...prev, [noteId]: { loading: true, text: '' } }));
        try {
            console.log('Summarize clicked for note', noteId);
            const updated = await notesApi.summarize(course.id, noteId);
            const text = updated.summary || updated.data?.summary || 'No summary returned.';
            console.log('Summarize success for note', noteId, 'summary:', text);
            setSummarizedNotes(prev => ({ ...prev, [noteId]: { loading: false, text } }));
        } catch (err) {
            console.error('Summarize failed for note', noteId, err);
            const note = notes.find(n => n.id === noteId);
            const base = note?.content || note?.body || '';
            const fallback = base
                ? base.substring(0, 200) + (base.length > 200 ? '...' : '')
                : '';
            const message = err?.message
                ? `Failed to generate summary from server (${err.message}).${fallback ? ' Showing a quick preview of your note instead.' : ''}`
                : (fallback ? 'Showing a quick preview of your note.' : 'Failed to generate summary.');
            setSummarizedNotes(prev => ({
                ...prev,
                [noteId]: {
                    loading: false,
                    text: fallback || message,
                }
            }));
        }
    };

    // ── Save new note ─────────────────────────────────────────────────────────
    const handleSaveNote = async () => {
        if (!isAuthenticated) { alert('Please sign in to add notes'); return; }
        if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
        setSaveLoading(true);
        try {
            const created = await notesApi.create(course.id, { title: newNoteTitle.trim(), body: newNoteContent.trim() });
            const normalized = { ...created, content: created.body || '', meta: `Just now · ${wordCount(created.body)} words` };
            setNotes(prev => [normalized, ...prev]);
            if (onUpdateCourse) onUpdateCourse({ ...course, notesCount: (course.notesCount || 0) + 1 });
            setNewNoteTitle(''); setNewNoteContent(''); setIsAddingNote(false);
            setExpandedNote(created.id);
        } catch (err) { alert(`Failed to save note: ${err.message}`); }
        finally { setSaveLoading(false); }
    };

    // ── Edit note ─────────────────────────────────────────────────────────────
    const startEditNote = (e, note) => {
        e.stopPropagation();
        setEditingNoteId(note.id);
        setEditNoteTitle(note.title);
        setEditNoteContent(note.content || note.body || '');
        setExpandedNote(note.id);
    };

    const handleSaveEditNote = async () => {
        if (!editNoteTitle.trim() || !editNoteContent.trim()) return;
        setEditLoading(true);
        try {
            const updated = await notesApi.update(course.id, editingNoteId, { title: editNoteTitle.trim(), body: editNoteContent.trim() });
            const normalized = { ...updated, content: updated.body || '', meta: `Edited just now · ${wordCount(updated.body)} words` };
            setNotes(prev => prev.map(n => n.id === editingNoteId ? normalized : n));
            setEditingNoteId(null);
        } catch (err) { alert(`Failed to update note: ${err.message}`); }
        finally { setEditLoading(false); }
    };

    // ── Delete note ───────────────────────────────────────────────────────────
    const handleDeleteNote = async (e, id) => {
        e.stopPropagation();
        if (!confirm('Delete this note?')) return;
        try {
            await notesApi.remove(course.id, id);
            setNotes(prev => prev.filter(n => n.id !== id));
            if (onUpdateCourse) onUpdateCourse({ ...course, notesCount: Math.max(0, (course.notesCount || 1) - 1) });
        } catch (err) { alert(`Failed to delete note: ${err.message}`); }
    };

    if (!course) return null;

    return (
        <div className="course-details-wrapper">

            {/* Back Nav */}
            <div className="course-nav-bar">
                <button className="back-btn" onClick={onBack}>
                    <ArrowLeft size={18} /><span>Back to Dashboard</span>
                </button>
                <div className="breadcrumbs">
                    <span>Courses</span>
                    <ChevronRight size={14} className="separator" />
                    <span className="current">{course.title}</span>
                </div>
            </div>

            <div className="course-card-inner">
                {/* Header */}
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
                        <div className="stat-pill"><FileText size={14} /> {notes.length} Notes</div>
                    </div>
                </header>



                <div className="course-content-grid">
                    {/* Study Plan */}
                    <div className="course-timeline-section">
                        <h3 className="section-heading">Study Plan</h3>
                        <div className="timeline-container">
                            {course.learningPath && course.learningPath.length > 0 ? (
                                course.learningPath.map((item, index) => (
                                    <div key={item.id || index} className={`timeline-item ${index === 0 ? 'active' : 'pending'}`}>
                                        <div className="timeline-dot">{index === 0 ? <Clock size={14} /> : <BookOpen size={14} />}</div>
                                        <div className="timeline-content"><h4>{item.day}</h4><p>{item.topic}</p></div>
                                    </div>
                                ))
                            ) : (
                                <>
                                    <div className="timeline-item completed"><div className="timeline-dot"><CheckCircle2 size={14} /></div><div className="timeline-content"><h4>Day 1</h4><p>Read Chapters 1-2 & Basics Quiz</p></div></div>
                                    <div className="timeline-item active"><div className="timeline-dot"><Clock size={14} /></div><div className="timeline-content"><h4>Day 2</h4><p>Review Notes & Practice Problems</p></div></div>
                                    <div className="timeline-item pending"><div className="timeline-dot"><BookOpen size={14} /></div><div className="timeline-content"><h4>Day 3</h4><p>Advanced Topics & Midterm Prep</p></div></div>
                                    <div className="timeline-item pending"><div className="timeline-dot"><BookOpen size={14} /></div><div className="timeline-content"><h4>End of Course</h4><p>Final Exam & Project Submission</p></div></div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="course-notes-section">
                        <div className="notes-header-row">
                            <h3 className="section-heading">Notes ({notes.length})</h3>
                            <button
                                className="add-note-btn"
                                onClick={() => {
                                    if (!isAuthenticated) { alert('Please sign in to add notes'); return; }
                                    setIsAddingNote(v => !v);
                                    setEditingNoteId(null);
                                }}
                            >
                                {isAddingNote ? <><X size={16} /> Cancel</> : <><Plus size={16} /> New Note</>}
                            </button>
                        </div>

                        {/* New Note Editor */}
                        {isAddingNote && (
                            <NoteEditor
                                title={newNoteTitle}
                                content={newNoteContent}
                                onTitleChange={setNewNoteTitle}
                                onContentChange={setNewNoteContent}
                                onSave={handleSaveNote}
                                onCancel={() => { setIsAddingNote(false); setNewNoteTitle(''); setNewNoteContent(''); }}
                                saveLabel="Save Note"
                                loading={saveLoading}
                            />
                        )}

                        {/* Notes List */}
                        <div className="notes-list">
                            {notesLoading && <p className="notes-empty-hint">Loading notes…</p>}
                            {!notesLoading && notes.length === 0 && (
                                <p className="notes-empty-hint">
                                    {isAuthenticated ? 'No notes yet — add your first one above.' : 'Sign in to add notes.'}
                                </p>
                            )}

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
                                            {editingNoteId === note.id ? (
                                                <NoteEditor
                                                    title={editNoteTitle}
                                                    content={editNoteContent}
                                                    onTitleChange={setEditNoteTitle}
                                                    onContentChange={setEditNoteContent}
                                                    onSave={handleSaveEditNote}
                                                    onCancel={() => setEditingNoteId(null)}
                                                    saveLabel="Save Changes"
                                                    loading={editLoading}
                                                />
                                            ) : (
                                                <>
                                                    <div className="note-body markdown-rendered-content">
                                                        <ReactMarkdown>{note.content}</ReactMarkdown>
                                                    </div>
                                                    <div className="note-actions">
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            {isAuthenticated && (
                                                                <>
                                                                    <button className="arrow-btn" style={{ padding: '0.4rem', border: '1px solid var(--border-light)' }} onClick={e => startEditNote(e, note)} title="Edit"><Edit2 size={14} /></button>
                                                                    <button className="arrow-btn" style={{ padding: '0.4rem', border: '1px solid #ffe4e6', color: '#e11d48', background: '#fff1f2' }} onClick={e => handleDeleteNote(e, note.id)} title="Delete"><Trash2 size={14} /></button>
                                                                </>
                                                            )}
                                                        </div>
                                                        <button className="btn-summarize-ai-small" onClick={() => handleSummarizeNote(note.id)}>
                                                            <Sparkles size={14} style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                                                            {summarizedNotes[note.id] && !summarizedNotes[note.id].loading ? 'Hide Summary' : 'Summarize with AI'}
                                                        </button>
                                                    </div>

                                                    {summarizedNotes[note.id] && (
                                                        <div className="ai-summary-block">
                                                            {summarizedNotes[note.id].loading ? (
                                                                <div className="ai-loading"><Sparkles size={14} className="spining-sparkle" /><span>Generating summary…</span></div>
                                                            ) : (
                                                                <div className="ai-summary-content">
                                                                    <div className="ai-summary-header"><Sparkles size={14} /><span>AI Summary</span></div>
                                                                    <p>{summarizedNotes[note.id].text}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* AI Prompt Box */}
                        <div className="detail-ai-summarizer">
                            <h2 className="content-title">What do you want to study?</h2>
                            <p className="content-subtitle">e.g., &apos;Summarize my {course.title} notes or quiz me.&apos;</p>
                            <div className="input-container">
                                <textarea className="study-input" placeholder={isAuthenticated ? 'Type your question here...' : 'Please sign in to use AI features'} rows={4} disabled={!isAuthenticated} />
                            </div>
                            <div className="ai-action-buttons">
                                <button className="btn-generate" onClick={() => { if (!isAuthenticated) { alert('Please sign in to use AI features'); } }}>
                                    <Sparkles size={16} style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                                    Generate with AI
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

function timeAgoLabel(isoDate) {
    const diff = Date.now() - new Date(isoDate).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m || 1}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

function wordCount(text = '') {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

export default CourseDetails;
