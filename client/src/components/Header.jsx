import { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDept } from '../context/DeptContext';
import {
  LogOut, Database, Menu, X,
  LayoutDashboard, FilePlus2, Shuffle, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { to: '/',            label: 'Dashboard',      icon: <LayoutDashboard size={15} /> },
  { to: '/create-exam', label: 'Create Exam',     icon: <FilePlus2 size={15} /> },
  { to: '/join-exam',   label: 'Hall Allocation', icon: <Shuffle size={15} /> },
  { to: '/history',     label: 'History',         icon: <History size={15} /> },
];

const Header = () => {
  const { user, logout: originalLogout } = useAuth();
  const { selectedDept, setDept } = useDept();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const logout = () => {
    originalLogout();
    setDept('');
    setIsMenuOpen(false);
    navigate('/login');
  };

  const handleChangeDept = () => {
    setDept('');
    setIsMenuOpen(false);
    navigate('/select-dept');
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="main-header">
      {/* Brand */}
      <Link to="/" className="header-brand" onClick={closeMenu}>
        <img
          src="/assets/psna_logo.png"
          alt="PSNA Logo"
          className="college-logo"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div className="title-container">
          <h1 className="header-title">
            PSNA College of <span className="title-extra">Engineering and Technology</span>
          </h1>
          <p className="hide-mobile">Exam Hall Invigilator Allocation System</p>
        </div>
      </Link>

      {/* Desktop Navigation */}
      {user && selectedDept && (
        <nav className="header-nav hide-mobile">
          {NAV_LINKS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `header-nav-link${isActive ? ' active' : ''}`
              }
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>
      )}

      {user && selectedDept && (
        <>
          {/* Desktop Actions */}
          <div className="header-actions hide-mobile">
            <button
              className="dept-badge header-dept-badge"
              onClick={handleChangeDept}
              title="Click to switch department"
              type="button"
            >
              <Database size={14} />
              <span>{selectedDept}</span>
            </button>

            <button
              onClick={logout}
              className="logout-btn"
              type="button"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="menu-toggle show-mobile"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
            type="button"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Mobile Sidebar Drawer */}
          <AnimatePresence>
            {isMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={closeMenu}
                  className="mobile-overlay"
                />
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                  className="mobile-sidebar"
                >
                  {/* Sidebar Header */}
                  <div className="sidebar-header">
                    <img
                      src="/assets/psna_logo.png"
                      alt="PSNA Logo"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <button
                      className="close-btn"
                      onClick={closeMenu}
                      type="button"
                      aria-label="Close menu"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Sidebar Content */}
                  <div className="sidebar-content">
                    {/* User Info */}
                    <div className="sidebar-user-info">
                      <div className="user-avatar">{selectedDept[0]}</div>
                      <div>
                        <h3>Administrator</h3>
                        <p>{selectedDept} Department</p>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <p className="sidebar-section-label">Navigation</p>
                    <nav className="sidebar-nav">
                      {NAV_LINKS.map(({ to, label, icon }) => (
                        <NavLink
                          key={to}
                          to={to}
                          end={to === '/'}
                          onClick={closeMenu}
                          className={({ isActive }) =>
                            `sidebar-link${isActive ? ' active' : ''}`
                          }
                        >
                          {icon}
                          <span>{label}</span>
                        </NavLink>
                      ))}
                    </nav>

                    <div className="sidebar-divider" />

                    {/* Account Actions */}
                    <p className="sidebar-section-label">Account</p>
                    <nav className="sidebar-nav">
                      <button
                        onClick={handleChangeDept}
                        className="sidebar-link"
                        type="button"
                      >
                        <Database size={16} />
                        <span>Switch Department</span>
                      </button>

                      <button
                        onClick={logout}
                        className="sidebar-link logout"
                        type="button"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </nav>
                  </div>

                  {/* Sidebar Footer */}
                  <div className="sidebar-footer">
                    <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '2px' }}>
                      PSNA ExamCell Portal
                    </p>
                    <p>© {new Date().getFullYear()} PSNA College of Engineering and Technology</p>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </header>
  );
};

export default Header;
