import request from '../utils/request';
import type { AIModel, SearchResult, UpdateUserWordStatusRequest, Word, WordListResponse } from '../types';

export const searchWord = (word: string, model: AIModel = 'qwen-plus') => {
  return request.get<unknown, SearchResult>('/words/search', {
    params: { word, model },
  });
};

export const getMyWords = (page: number, pageSize: number) => {
  return request.get<unknown, WordListResponse>('/user-words', {
    params: { page, page_size: pageSize },
  });
};

export const addUserWord = (word: Word) => {
  const synonyms = Array.isArray(word.synonyms) ? word.synonyms : [];
  return request.post<unknown, { word_id: number }>('/user-words', {
    word: word.word,
    translation: word.translation,
    example_sentence: word.example_sentence,
    example_translation: word.example_translation,
    synonyms,
  });
};

export const updateUserWordStatus = (wordID: number, isMastered: boolean) => {
  const data: UpdateUserWordStatusRequest = { is_mastered: isMastered };
  return request.patch<unknown, null>(`/user-words/${wordID}/status`, data);
};

export const removeUserWord = (wordID: number) => {
  return request.delete<unknown, null>(`/user-words/${wordID}`);
};