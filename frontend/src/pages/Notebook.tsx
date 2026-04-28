import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ThemeToggle from '../components/ThemeToggle';
import { getMyWords, removeUserWord, updateUserWordStatus } from '../api/word';
import type { Word } from '../types';
import { parseTranslation } from '../utils/wordParser';

const normalizeWord = (word: Word): Word => {
  let synonyms: string[] = [];

  if (Array.isArray(word.synonyms)) {
    synonyms = word.synonyms;
  } else if (typeof word.synonyms === 'string' && word.synonyms.trim()) {
    try {
      const parsed = JSON.parse(word.synonyms);
      synonyms = Array.isArray(parsed) ? parsed : [];
    } catch {
      synonyms = [];
    }
  }

  return {
    ...word,
    synonyms,
    definitions: parseTranslation(word.translation),
  };
};

const Notebook: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [actionLoadingID, setActionLoadingID] = useState<number | null>(null);

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    setListLoading(true);
    try {
      const res = await getMyWords(1, 100);
      setWords((res.list || []).map(normalizeWord));
    } catch (err) {
      console.error('加载单词本失败', err);
    } finally {
      setListLoading(false);
    }
  };

  const handleToggleMastered = async (word: Word) => {
    if (actionLoadingID !== null) return;

    setActionLoadingID(word.id);
    try {
      const nextStatus = !word.is_mastered;
      await updateUserWordStatus(word.id, nextStatus);
      setWords((prev) =>
        prev.map((item) => (item.id === word.id ? { ...item, is_mastered: nextStatus } : item)),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误';
      alert(`更新状态失败: ${message}`);
    } finally {
      setActionLoadingID(null);
    }
  };

  const handleRemove = async (wordID: number) => {
    if (actionLoadingID !== null) return;

    setActionLoadingID(wordID);
    try {
      await removeUserWord(wordID);
      setWords((prev) => prev.filter((item) => item.id !== wordID));
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误';
      alert(`移出生词本失败: ${message}`);
    } finally {
      setActionLoadingID(null);
    }
  };

  return (
    <div className="chat-shell">
      <Navbar />

      <main className="chat-main">
        <header className="chat-header">
          <div></div>
          <div className="header-title">
            <p className="eyebrow">AI Vocabulary Assistant</p>
            <h1>我的单词本</h1>
          </div>
          <div className="header-right">
            <ThemeToggle />
          </div>
        </header>

        <section className="chat-content" aria-label="我的单词本">
          {listLoading && (
            <div className="assistant-message">
              <div className="message-avatar">AI</div>
              <div className="message-card muted-card">正在加载你的单词本...</div>
            </div>
          )}

          {!listLoading && words.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">Aa</div>
              <h2>暂无单词</h2>
              <p>通过侧栏“新建查询”查单词，并保存到单词本。</p>
            </div>
          )}

          {!listLoading && words.length > 0 && (
            <div className="notebook-list">
              {words.map((item) => (
                <article key={item.id} className={`notebook-word-row${item.is_mastered ? ' mastered' : ''}`}>
                  <div className="notebook-word-main">
                    <h2>{item.word}</h2>
                    {item.definitions && item.definitions.length > 0 ? (
                      <div className="word-definitions">
                        {item.definitions.map((def, idx) => (
                          <div key={idx} className="definition-item">
                            {def.pos && <span className="pos-tag">{def.pos}</span>}
                            <span className="meaning-text">{def.meanings.join('；')}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>{item.translation}</p>
                    )}
                  </div>
                  <div className="notebook-word-meta">
                    {item.is_mastered && <span className="status-chip">已掌握</span>}
                    <button
                      className="secondary-button"
                      onClick={() => handleToggleMastered(item)}
                      disabled={actionLoadingID === item.id}
                    >
                      {item.is_mastered ? '标记为未掌握' : '标记为已掌握'}
                    </button>
                    <button
                      className="secondary-button danger-text"
                      onClick={() => handleRemove(item.id)}
                      disabled={actionLoadingID === item.id}
                    >
                      移除
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Notebook;
