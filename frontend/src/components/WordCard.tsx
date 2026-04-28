import React from 'react';
import type { Word } from '../types';

interface WordCardProps {
  word: Word;
  onToggleMastered?: (word: Word) => void;
  onRemove?: (wordID: number) => void;
}

const WordCard: React.FC<WordCardProps> = ({ word, onToggleMastered, onRemove }) => {
  const normalizeSynonyms = (synonyms: unknown): string[] => {
    if (Array.isArray(synonyms)) return synonyms;
    if (typeof synonyms === 'string') {
      try {
        return JSON.parse(synonyms);
      } catch {
        return [];
      }
    }
    return [];
  };

  const synonyms = normalizeSynonyms(word.synonyms);

  return (
    <div
      style={{
        borderBottom: '1px solid #eee',
        padding: '15px 0',
        opacity: word.is_mastered ? 0.6 : 1,
      }}
    >
      <h3>
        {word.word}{' '}
        <small style={{ color: '#666' }}>[{word.translation}]</small>
        {word.is_mastered && (
          <span
            style={{
              marginLeft: '10px',
              fontSize: '0.7em',
              background: '#28a745',
              color: '#fff',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            已掌握
          </span>
        )}
      </h3>
      <p>
        <strong>例句：</strong>
        {word.example_sentence}
      </p>
      <p style={{ color: '#888', fontSize: '0.9em' }}>{word.example_translation}</p>
      <div style={{ marginBottom: '10px' }}>
        {synonyms.map((synonym) => (
          <span
            key={synonym}
            style={{
              marginRight: '8px',
              background: '#f0f0f0',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.9em',
            }}
          >
            {synonym}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {onToggleMastered && (
          <button onClick={() => onToggleMastered(word)}>
            {word.is_mastered ? '标记为未掌握' : '标记为已掌握'}
          </button>
        )}
        {onRemove && (
          <button onClick={() => onRemove(word.id)}>移除</button>
        )}
      </div>
    </div>
  );
};

export default WordCard;