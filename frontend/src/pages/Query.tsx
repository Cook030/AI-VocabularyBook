import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import ThemeToggle from '../components/ThemeToggle';
import { addUserWord, getMyWords, searchWord } from '../api/word';
import type { AIModel, Word } from '../types';
import { parseTranslation } from '../utils/wordParser';

const modelLabels: Record<string, string> = {
  'qwen-plus': 'Qwen Plus',
  'qwen-max': 'Qwen Max',
  'qwen-turbo': 'Qwen Turbo',
  'deepseek-v3': 'DeepSeek V3',
};

const ModelSelector: React.FC<{
  value: AIModel;
  onChange: (model: AIModel) => void;
}> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="model-selector">
      <button
        className="model-selector-trigger"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className="model-name">{modelLabels[value] || value}</span>
        <svg
          className={`model-arrow${open ? ' open' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="model-dropdown">
          {(Object.keys(modelLabels) as AIModel[]).map((key) => (
            <button
              key={key}
              className={`model-option${key === value ? ' active' : ''}`}
              onClick={() => {
                onChange(key);
                setOpen(false);
              }}
              type="button"
            >
              {modelLabels[key]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

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

const Query: React.FC = () => {
  const [savedWords, setSavedWords] = useState<Word[]>([]);
  const [searchedWord, setSearchedWord] = useState<Word | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [model, setModel] = useState<AIModel>('qwen-plus');
  const [searchLoading, setSearchLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchSavedWords();
  }, []);

  const savedVersion = useMemo(() => {
    if (!searchedWord) return null;
    return savedWords.find((item) => item.id === searchedWord.id || item.word === searchedWord.word) || null;
  }, [searchedWord, savedWords]);

  const currentWord = savedVersion || searchedWord;
  const isSaved = Boolean(savedVersion);

  const fetchSavedWords = async () => {
    try {
      const res = await getMyWords(1, 100);
      setSavedWords((res.list || []).map(normalizeWord));
    } catch (err) {
      console.error('加载单词本失败', err);
    }
  };

  const handleSearchWord = async () => {
    const wordText = inputValue.trim();
    if (!wordText || searchLoading) return;

    setSearchLoading(true);
    try {
      const result = await searchWord(wordText, model);
      const word = normalizeWord(result.word);
      setSearchedWord(word);
      setInputValue('');
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误';
      alert(`查询单词失败: ${message}`);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSaveWord = async () => {
    if (!currentWord || isSaved || saveLoading) return;

    setSaveLoading(true);
    try {
      const res = await addUserWord(currentWord);
      const savedWord = { ...currentWord, id: res.word_id, is_mastered: false };
      setSavedWords((prev) => [savedWord, ...prev.filter((item) => item.id !== savedWord.id)]);
      setSearchedWord(savedWord);
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误';
      alert(`保存到单词本失败: ${message}`);
    } finally {
      setSaveLoading(false);
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
            <h1>新建查询</h1>
          </div>
          <div className="header-right">
            <ThemeToggle />
          </div>
        </header>

        <section className="chat-content" aria-label="单词查询区">
          <div className="assistant-message intro-message">
            <div className="message-avatar">📚</div>
            <div className="message-card">
              <h2>查询英文单词</h2>
              <p>输入一个单词，我会展示释义、例句、中文翻译和近义词。查询记录不会保留，只有点击保存后才会加入单词本。</p>
            </div>
          </div>

          {!currentWord && (
            <div className="empty-state">
              <div className="empty-icon">😄</div>
              <h2>开始一次新查询</h2>
              <p>在下方输入英文单词，例如 persistent、eloquent 或 momentum。</p>
            </div>
          )}

          {currentWord && (
            <article className="word-message">
              <div className="message-avatar">AI</div>
              <div className="word-card">
                <div className="word-card-header">
                  <div>
                    <h2>{currentWord.word}</h2>
                    {currentWord.definitions && currentWord.definitions.length > 0 ? (
                      <div className="word-definitions">
                        {currentWord.definitions.map((def, idx) => (
                          <div key={idx} className="definition-item">
                            {def.pos && <span className="pos-tag">{def.pos}</span>}
                            <span className="meaning-text">{def.meanings.join('；')}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="translation">{currentWord.translation}</p>
                    )}
                  </div>
                  {isSaved ? (
                    <span className="status-chip">已在单词本</span>
                  ) : (
                    <span className="status-chip pending-chip">新词</span>
                  )}
                </div>

                <div className="example-block">
                  <p className="example-label">Example</p>
                  <p className="example-sentence">{currentWord.example_sentence}</p>
                  <p className="example-translation">{currentWord.example_translation}</p>
                </div>

                {Array.isArray(currentWord.synonyms) && currentWord.synonyms.length > 0 && (
                  <div className="synonym-row">
                    {currentWord.synonyms.map((synonym) => (
                      <span key={synonym} className="synonym-chip">
                        {synonym}
                      </span>
                    ))}
                  </div>
                )}

                <div className="word-actions">
                  <button className="send-button inline-send-button" onClick={handleSaveWord} disabled={isSaved || saveLoading}>
                    {isSaved ? '已保存' : saveLoading ? '保存中...' : '保存到单词本'}
                  </button>
                </div>
              </div>
            </article>
          )}
        </section>

        <footer className="composer-wrap">
          <div className="composer">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchWord();
                }
              }}
              placeholder="输入英文单词进行查询，如 persistent..."
              aria-label="输入英文单词"
            />
            <ModelSelector value={model} onChange={setModel} />
            <button className="send-button" onClick={handleSearchWord} disabled={searchLoading || !inputValue.trim()}>
              {searchLoading ? '查询中' : '查询'}
            </button>
          </div>
          <p className="composer-hint">查询页不保存历史；保存后的单词可在侧栏“我的单词本”查看。</p>
        </footer>
      </main>
    </div>
  );
};

export default Query;
