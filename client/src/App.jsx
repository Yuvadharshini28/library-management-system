import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import BooksList from './pages/BooksList';
import MembersList from './pages/MembersList';
import IssueBook from './pages/IssueBook';
import Transactions from './pages/Transactions';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedBookForIssue, setSelectedBookForIssue] = useState(null);
  const [selectedMemberForIssue, setSelectedMemberForIssue] = useState(null);

  const clearPreselections = () => {
    setSelectedBookForIssue(null);
    setSelectedMemberForIssue(null);
  };

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'books' && (
          <BooksList
            setActiveTab={setActiveTab}
            setSelectedBookForIssue={setSelectedBookForIssue}
          />
        )}
        {activeTab === 'members' && (
          <MembersList
            setActiveTab={setActiveTab}
            setSelectedMemberForIssue={setSelectedMemberForIssue}
          />
        )}
        {activeTab === 'issue' && (
          <IssueBook
            setActiveTab={setActiveTab}
            preselectedBook={selectedBookForIssue}
            preselectedMember={selectedMemberForIssue}
            clearPreselections={clearPreselections}
          />
        )}
        {activeTab === 'transactions' && <Transactions />}
      </main>

      <footer className="footer">
        <div>
          <strong>Library Management System</strong> &bull; Developed with MERN Stack (MongoDB, Express, React, Node.js)
        </div>
        <div style={{ marginTop: '0.25rem', color: 'var(--slate-400)' }}>
          Academic / Full-Stack Project Model
        </div>
      </footer>
    </div>
  );
}

export default App;
