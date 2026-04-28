import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth';
import './Auth.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/notebook', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(username, password);
      localStorage.setItem('token', res.token);
      navigate('/notebook', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : '登录失败，请检查网络';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🤗</div>
          <h2>AI 单词本</h2>
          <p className="auth-subtitle">登录以开始你的学习之旅</p>
        </div>
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              id="username"
              type="text"
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              id="password"
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? (
              <span className="loading-spinner">登录中...</span>
            ) : (
              '立即登录'
            )}
          </button>
        </form>
        <div className="auth-footer">
          <p>还没有账号？<Link to="/register" className="auth-link">立即注册</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
