import { useState } from 'react';
import TopNav from './components/TopNav';
import Hero from './components/Hero';
import CourseSection from './components/CourseSection';
import CourseDetails from './components/CourseDetails';
import Auth from './components/Auth';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'course'
  const [selectedCourse, setSelectedCourse] = useState(null);

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

  return (
    <div className="app-main-container">
      <TopNav
        onHome={handleBackToDashboard}
        onLogin={handleGoToLogin}
        onSignup={handleGoToSignup}
      />
      <main className="app-content-wrapper">
        {currentView === 'dashboard' ? (
          <>
            <Hero />
            <CourseSection onGoToCourse={handleGoToCourse} />
          </>
        ) : currentView === 'course' ? (
          <CourseDetails
            course={selectedCourse}
            onBack={handleBackToDashboard}
          />
        ) : (
          <Auth
            initialMode={currentView === 'login' ? 'login' : 'signup'}
            onBack={handleBackToDashboard}
          />
        )}
      </main>
    </div>
  );
}

export default App;
