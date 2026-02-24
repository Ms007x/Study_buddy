import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Calendar, BookOpen, Upload, Edit2, Save, X, Award, Clock, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { courses as coursesApi } from '../services/api';
import './Profile.css';

const Profile = ({ onBack }) => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    
    // Profile state (read-only now)
    const [profileData, setProfileData] = useState({
        fullName: user?.full_name || '',
        email: user?.email || '',
        bio: '',
        avatar: null
    });
    
    // Courses state
    const [uploadedCourses, setUploadedCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(false);

    useEffect(() => {
        fetchUserData();
        fetchUserCourses();
    }, []);

    const fetchUserData = async () => {
        try {
            // In a real app, you'd fetch user profile data from API
            // For now, we'll use mock data
            setProfileData(prev => ({
                ...prev,
                bio: 'Passionate learner and educator. Love sharing knowledge and helping others achieve their learning goals.'
            }));
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserCourses = async () => {
        setCoursesLoading(true);
        try {
            const allCourses = await coursesApi.list();
            
            // Filter courses uploaded by user
            const uploaded = allCourses.filter(course => course.owner_id === user?.id);
            setUploadedCourses(uploaded);
            
            // For enrolled courses, in a real app you'd have an enrollment API
            // For now, we'll show courses the user doesn't own as "enrolled"
            const enrolled = allCourses.filter(course => course.owner_id !== user?.id).slice(0, 3);
            setEnrolledCourses(enrolled);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setCoursesLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        onBack();
    };

    if (loading) {
        return (
            <div className="profile-wrapper">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <span style={{ fontSize: '1.1rem', color: 'var(--text-blue-gray)' }}>Loading profile...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-wrapper">
            {/* Top Navigation */}
            <div className="course-nav-bar">
                <button className="back-btn" onClick={onBack}>
                    <ArrowLeft size={18} />
                    <span>Back to Dashboard</span>
                </button>
                <div className="breadcrumbs">
                    <span>Dashboard</span>
                    <span className="separator">›</span>
                    <span className="current">Profile</span>
                </div>
            </div>

            <div className="profile-container">
                {/* Profile Header */}
                <div className="profile-header">
                    <div className="profile-avatar-section">
                        <div className="profile-avatar">
                            {profileData.avatar ? (
                                <img src={profileData.avatar} alt="Profile" />
                            ) : (
                                <div className="avatar-placeholder">
                                    <User size={48} />
                                </div>
                            )}
                        </div>
                        <div className="profile-info">
                            <h2 className="profile-name">{profileData.fullName}</h2>
                            <div className="profile-email">
                                <Mail size={14} />
                                <span>{profileData.email}</span>
                            </div>
                            <div className="profile-joined">
                                <Calendar size={14} />
                                <span>Joined {new Date(user?.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Tabs */}
                <div className="profile-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <User size={16} /> Profile
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'uploaded' ? 'active' : ''}`}
                        onClick={() => setActiveTab('uploaded')}
                    >
                        <Upload size={16} /> Uploaded Courses
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'enrolled' ? 'active' : ''}`}
                        onClick={() => setActiveTab('enrolled')}
                    >
                        <BookOpen size={16} /> Enrolled Courses
                    </button>
                </div>

                {/* Tab Content */}
                <div className="profile-content">
                    {activeTab === 'profile' && (
                        <div className="profile-tab-content">
                            <div className="bio-section">
                                <div className="section-header">
                                    <h3>Bio</h3>
                                </div>
                                <p className="bio-text">{profileData.bio || 'No bio added yet.'}</p>
                            </div>

                            <div className="stats-section">
                                <h3>Statistics</h3>
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-icon">
                                            <Upload size={20} />
                                        </div>
                                        <div className="stat-info">
                                            <div className="stat-number">{uploadedCourses.length}</div>
                                            <div className="stat-label">Courses Uploaded</div>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">
                                            <BookOpen size={20} />
                                        </div>
                                        <div className="stat-info">
                                            <div className="stat-number">{enrolledCourses.length}</div>
                                            <div className="stat-label">Courses Enrolled</div>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">
                                            <Award size={20} />
                                        </div>
                                        <div className="stat-info">
                                            <div className="stat-number">0</div>
                                            <div className="stat-label">Certificates</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="account-section">
                                <h3>Account</h3>
                                <div className="account-actions">
                                    <button className="account-btn danger" onClick={handleLogout}>
                                        <X size={16} /> Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'uploaded' && (
                        <div className="courses-tab-content">
                            <h3>My Uploaded Courses</h3>
                            {coursesLoading ? (
                                <div className="loading">Loading courses...</div>
                            ) : uploadedCourses.length > 0 ? (
                                <div className="courses-grid">
                                    {uploadedCourses.map(course => (
                                        <div key={course.id} className={`course-card ${course.colorClass}`}>
                                            <div className="course-card-header">
                                                <div className="course-icon">
                                                    {course.emoji || <BookOpen size={24} />}
                                                </div>
                                                <div className="course-meta">
                                                    <span className="course-date">
                                                        {new Date(course.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <h4 className="course-title">{course.title}</h4>
                                            <p className="course-description">{course.description}</p>
                                            <div className="course-stats">
                                                <span className="stat">
                                                    <FileText size={12} />
                                                    {course.notesCount || 0} notes
                                                </span>
                                                <span className="stat">
                                                    <Clock size={12} />
                                                    {course.timeAgo}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <Upload size={48} />
                                    <h4>No courses uploaded yet</h4>
                                    <p>Start by creating your first course!</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'enrolled' && (
                        <div className="courses-tab-content">
                            <h3>Enrolled Courses</h3>
                            {coursesLoading ? (
                                <div className="loading">Loading courses...</div>
                            ) : enrolledCourses.length > 0 ? (
                                <div className="courses-grid">
                                    {enrolledCourses.map(course => (
                                        <div key={course.id} className={`course-card ${course.colorClass}`}>
                                            <div className="course-card-header">
                                                <div className="course-icon">
                                                    {course.emoji || <BookOpen size={24} />}
                                                </div>
                                                <div className="course-meta">
                                                    <span className="course-instructor">
                                                        by {course.owner_name}
                                                    </span>
                                                    <span className="course-date">
                                                        {new Date(course.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <h4 className="course-title">{course.title}</h4>
                                            <p className="course-description">{course.description}</p>
                                            <div className="course-stats">
                                                <span className="stat">
                                                    <FileText size={12} />
                                                    {course.notesCount || 0} notes
                                                </span>
                                                <span className="stat">
                                                    <Clock size={12} />
                                                    {course.timeAgo}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <BookOpen size={48} />
                                    <h4>No courses enrolled yet</h4>
                                    <p>Explore available courses and start learning!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
