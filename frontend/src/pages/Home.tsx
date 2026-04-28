import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home: React.FC = () => {
  return (
    <div className="chat-shell">
      <Navbar />
      <div className="chat-main">
        <div className="home-container">
          <h1 className="home-title">Welcome to AI Vocabulary</h1>
          <p className="home-subtitle">
            使用AI智能辅助，高效学习英语单词
          </p>
          <div className="home-actions">
            <Link to="/notebook" className="btn btn-primary">
              进入单词本
            </Link>
          </div>
          <div className="home-features">
            <h2>功能特点</h2>
            <ul>
              <li>🤖 AI智能分析单词，提供精准释义和例句</li>
              <li>📚 个人生词本，帮你管理和复习单词</li>
              <li>✨ 标记掌握状态，追踪学习进度</li>
              <li>🔄 支持多种AI模型（通义千问、DeepSeek）</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;