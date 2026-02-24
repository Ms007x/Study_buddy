import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import TopNav from './components/TopNav';
import Hero from './components/Hero';
import CourseSection from './components/CourseSection';
import CourseDetails from './components/CourseDetails';
import CreateCourse from './components/CreateCourse';
import Profile from './components/Profile';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import Auth from './components/Auth';
import { courses as coursesApi } from './services/api';
import './App.css';

// ─── Inner app that has access to AuthContext ─────────────────────────────────
function AppInner() {
  const { isAuthenticated, loading: authLoading, handleOAuthSuccess, logout } = useAuth();

  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // ── Handle OAuth redirect callback (/auth/success?token=...&user=...) ─────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userRaw = params.get('user');
    if (token && userRaw) {
      try {
        const user = JSON.parse(decodeURIComponent(userRaw));
        handleOAuthSuccess(token, user);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        setCurrentView('dashboard');
      } catch (_) { /* ignore parse errors */ }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load courses from API (available to all users) ────────────────────────
  const fetchCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const data = await coursesApi.list();
      // Normalize backend shape to the colorClass + notes format the UI uses
      const normalized = (Array.isArray(data) ? data : []).map(c => ({
        ...c,
        colorClass: c.color || 'theme-blue',
        notes: [],         // notes are loaded lazily inside CourseDetails
        notesCount: c.note_count || 0,
        learningPath: Array.isArray(c.learning_path) ? c.learning_path : [],
        timeAgo: c.updated_at
          ? `Updated ${timeAgoLabel(c.updated_at)}`
          : 'Recently updated',
      }));
      setCourses(normalized);
    } catch (err) {
      console.error('Failed to load courses:', err.message);
    } finally {
      setCoursesLoading(false);
    }
  }, []); // Removed isAuthenticated dependency

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  // ── Routing helpers ───────────────────────────────────────────────────────────
  const handleGoToCourse = (course) => {
    // Find the fresh course data from the courses array to ensure we have learningPath
    const freshCourse = courses.find(c => c.id === course.id);
    setSelectedCourse(freshCourse || course);
    setCurrentView('course');
  };
  const handleBackToDash = () => { setSelectedCourse(null); setCurrentView('dashboard'); };
  const handleGoToLogin = () => setCurrentView('login');
  const handleGoToSignup = () => setCurrentView('signup');
  const handleGoToProfile = () => setCurrentView('profile');
  const handleGoToEditCourse = (course) => {
    // Find the fresh course data from the courses array to ensure we have learningPath
    const freshCourse = courses.find(c => c.id === course.id);
    setSelectedCourse(freshCourse || course);
    setCurrentView('edit-course');
  };
  const handleGoToCreate = () => {
    if (!isAuthenticated) {
      alert('Please sign in to create courses');
      setCurrentView('login');
    } else {
      setCurrentView('create-course');
    }
  };
  const handleLoginSuccess = () => { setCurrentView('dashboard'); fetchCourses(); };

  const handleCreateCourse = async (courseData) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      alert('Please sign in to create courses');
      setCurrentView('login');
      return;
    }

    try {
      // Create course in database via API
      const newCourse = await coursesApi.create({
        title: courseData.title,
        description: courseData.description,
        emoji: courseData.emoji || null,
        color: courseData.colorClass === 'theme-blue' ? '#3B82F6' :
          courseData.colorClass === 'theme-green' ? '#10B981' :
            courseData.colorClass === 'theme-purple' ? '#8B5CF6' :
              courseData.colorClass === 'theme-orange' ? '#F97316' : '#3B82F6',
        learningPath: courseData.learningPath || []
      });

      // Add to local state with proper formatting
      const formattedCourse = {
        ...newCourse,
        colorClass: newCourse.color || courseData.colorClass,
        notes: [],
        notesCount: 0,
        timeAgo: "Just now",
        learningPath: newCourse.learning_path || courseData.learningPath || []
      };

      setCourses(prev => [formattedCourse, ...prev]);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Failed to create course:', error);
      alert(`Failed to create course: ${error.message || 'Unknown error'}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    // Don't clear courses - they should be visible to everyone
    // Just refetch to ensure public courses are still visible
    fetchCourses();
    setCurrentView('dashboard');
  };

  const handleUpdateCourse = async (courseData) => {
    try {
      // Update course in database via API
      const updatedCourse = await coursesApi.update(selectedCourse.id, {
        title: courseData.title,
        description: courseData.description,
        emoji: courseData.emoji || null,
        color: courseData.colorClass === 'theme-blue' ? '#3B82F6' :
          courseData.colorClass === 'theme-green' ? '#10B981' :
            courseData.colorClass === 'theme-purple' ? '#8B5CF6' :
              courseData.colorClass === 'theme-orange' ? '#F97316' : '#3B82F6',
        learningPath: courseData.learningPath || []
      });

      // Normalize the response from backend
      const normalized = {
        ...updatedCourse,
        colorClass: updatedCourse.color || courseData.colorClass,
        notes: courseData.notes || [],
        notesCount: courseData.notesCount || 0,
        learningPath: Array.isArray(updatedCourse.learning_path) ? updatedCourse.learning_path : (courseData.learningPath || []),
        timeAgo: 'Updated just now',
      };

      setCourses(prev => prev.map(c => c.id === selectedCourse.id ? normalized : c));
      setSelectedCourse(normalized);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Failed to update course:', error);
      alert(`Failed to update course: ${error.message || 'Unknown error'}`);
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <span style={{ fontSize: '1.1rem', color: 'var(--text-blue-gray)' }}>Loading…</span>
      </div>
    );
  }

  return (
    <div className="app-main-container">
      <TopNav
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        onHome={handleBackToDash}
        onLogin={handleGoToLogin}
        onSignup={handleGoToSignup}
        onProfile={handleGoToProfile}
      />
      <main className="app-content-wrapper">
        {currentView === 'dashboard' ? (
          <>
            <Hero onGetStarted={handleGoToSignup} />
            <CourseSection
              courses={courses}
              setCourses={setCourses}
              loading={coursesLoading}
              onGoToCourse={handleGoToCourse}
              onGoToCreateCourse={handleGoToCreate}
              onGoToEditCourse={handleGoToEditCourse}
              isAuthenticated={isAuthenticated}
              onLoginRequired={handleGoToLogin}
            />
            <ContactSection />
          </>
        ) : currentView === 'create-course' ? (
          <CreateCourse onBack={handleBackToDash} onCreate={handleCreateCourse} />
        ) : currentView === 'edit-course' ? (
          <CreateCourse
            onBack={handleBackToDash}
            onCreate={handleUpdateCourse}
            editMode={true}
            initialData={selectedCourse}
          />
        ) : currentView === 'course' ? (
          <CourseDetails
            course={selectedCourse}
            onBack={handleBackToDash}
            onUpdateCourse={(updated) => {
              setSelectedCourse(updated);
              setCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
            }}
          />
        ) : currentView === 'profile' ? (
          <Profile onBack={handleBackToDash} />
        ) : (
          <Auth
            initialMode={currentView === 'login' ? 'login' : 'signup'}
            onBack={handleBackToDash}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

// ─── Simple relative-time helper ──────────────────────────────────────────────
function timeAgoLabel(isoDate) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m || 1}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Root export — wraps everything in AuthProvider ───────────────────────────
function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;
