import { useState } from 'react';
import TopNav from './components/TopNav';
import Hero from './components/Hero';
import CourseSection from './components/CourseSection';
import CourseDetails from './components/CourseDetails';
import CreateCourse from './components/CreateCourse';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import Auth from './components/Auth';
import './App.css';

const initialCourses = [
  {
    id: 1,
    title: "Operating Systems",
    description: "Memory management, concurrency, and file systems.",
    timeAgo: "Updated 2h ago",
    colorClass: "theme-blue",
    notes: [
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
    ]
  },
  {
    id: 2,
    title: "Database Management",
    description: "SQL, relational algebra, and normalization.",
    timeAgo: "Updated 1d ago",
    colorClass: "theme-purple",
    notes: []
  },
  {
    id: 3,
    title: "UI/UX Design",
    description: "Principles of effective human-computer interaction.",
    timeAgo: "Updated 3d ago",
    colorClass: "theme-magenta",
    notes: []
  },
  {
    id: 4,
    title: "Algorithms",
    description: "Graph algorithms, dynamic programming, and sorting.",
    timeAgo: "Updated 5d ago",
    colorClass: "theme-teal",
    notes: []
  }
];

function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'course' | 'login' | 'signup' | 'create-course'
  const [courses, setCourses] = useState(initialCourses);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleGoToCourse = (course) => {
    setSelectedCourse(course);
    setCurrentView('course');
  };

  const handleBackToDashboard = () => {
    setSelectedCourse(null);
    setCurrentView('dashboard');
  };

  const handleGoToLogin = () => {
    setCurrentView('login');
  };

  const handleGoToSignup = () => {
    setCurrentView('signup');
  };

  const handleGoToCreateCourse = () => {
    setCurrentView('create-course');
  };

  const handleCreateCourse = (newCourse) => {
    setCourses([newCourse, ...courses]);
    setCurrentView('dashboard');
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  return (
    <div className="app-main-container">
      <TopNav
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        onHome={handleBackToDashboard}
        onLogin={handleGoToLogin}
        onSignup={handleGoToSignup}
      />
      <main className="app-content-wrapper">
        {currentView === 'dashboard' ? (
          <>
            <Hero />
            <CourseSection
              courses={courses}
              setCourses={setCourses}
              onGoToCourse={handleGoToCourse}
              onGoToCreateCourse={handleGoToCreateCourse}
            />
            <ContactSection />
          </>
        ) : currentView === 'create-course' ? (
          <CreateCourse
            onBack={handleBackToDashboard}
            onCreate={handleCreateCourse}
          />
        ) : currentView === 'course' ? (
          <CourseDetails
            course={selectedCourse}
            onBack={handleBackToDashboard}
            onUpdateCourse={(updatedCourse) => {
              setSelectedCourse(updatedCourse);
              setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
            }}
          />
        ) : (
          <Auth
            initialMode={currentView === 'login' ? 'login' : 'signup'}
            onBack={handleBackToDashboard}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
