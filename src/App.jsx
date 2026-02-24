import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

function App() {
  return (
    <div className="flex h-full w-full">
      <Sidebar />
      <main className="flex-1" style={{ marginLeft: '280px', backgroundColor: 'var(--bg-color)', minHeight: '100vh' }}>
        <Topbar />
        <div className="content-container" style={{ padding: '0 2.5rem 2.5rem' }}>
          {/* Main content goes here */}
        </div>
      </main>
    </div>
  );
}

export default App;
