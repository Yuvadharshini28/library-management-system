import React from 'react';
import {
  BookOpen,
  LayoutDashboard,
  Users,
  ArrowRightLeft,
  BookPlus,
  Library
} from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'issue', label: 'Issue Book', icon: BookPlus },
    { id: 'transactions', label: 'Transactions & Returns', icon: ArrowRightLeft },
  ];

  return (
    <header className="navbar">
      <div className="nav-inner">
        <div className="brand" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
          <div className="brand-icon">
            <Library size={22} />
          </div>
          <div>
            <div>Library Management System</div>
            <div style={{ fontSize: '0.75rem', fontWeight: '500', color: '#6366f1' }}>MERN Stack Project</div>
          </div>
        </div>

        <nav className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
