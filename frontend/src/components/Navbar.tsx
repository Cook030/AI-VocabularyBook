import React from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="app-sidebar">
      <Link to="/query" className="sidebar-brand" aria-label="AI 单词本">
        <span className="brand-mark">AI</span>
        <span>单词本</span>
      </Link>

      <nav className="sidebar-nav" aria-label="主导航">
        <NavLink to="/query" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <span className="sidebar-link-icon">+</span>
          新建查询
        </NavLink>
        <NavLink to="/notebook" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <span className="sidebar-link-icon">Aa</span>
          我的单词本
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-pill">
          <span className="user-avatar">U</span>
          <span>Vocabulary Learner</span>
        </div>
        <button className="ghost-button danger" onClick={handleLogout}>
          退出登录
        </button>
      </div>
    </aside>
  );
};

export default Navbar;
