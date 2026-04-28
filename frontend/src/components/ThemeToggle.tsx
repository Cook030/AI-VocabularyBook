import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`切换到${theme === 'light' ? '暗色' : '亮色'}模式`}
      title={`当前主题：${theme === 'light' ? '亮色' : '暗色'}`}
    >
      <div className="theme-toggle-inner">
        {theme === 'light' ? (
          <>
            <span className="theme-icon">🌙</span>
            <span className="theme-text">暗色模式</span>
          </>
        ) : (
          <>
            <span className="theme-icon">☀️</span>
            <span className="theme-text">亮色模式</span>
          </>
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;