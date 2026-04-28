import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import './Auth.css';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/notebook', { replace: true });
    }
  }, [navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      alert('密码长度至少为6位');
      return;
    }

    setLoading(true);

    try {
      await register(username, password);
      alert('注册成功，请登录');
      navigate('/login');
    } catch (err) {
      const message = err instanceof Error ? err.message : '注册失败，请重试';
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
          <p className="auth-subtitle">注册以开始你的学习之旅</p>
        </div>
        <form onSubmit={handleRegister} className="auth-form">
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
              placeholder="请输入密码（至少6位）"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">确认密码</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? (
              <span className="loading-spinner">注册中...</span>
            ) : (
              '立即注册'
            )}
          </button>
        </form>
        <div className="auth-footer">
          <p>已有账号？<Link to="/login" className="auth-link">立即登录</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
