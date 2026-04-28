import request from '../utils/request';
import type { Word, WordListResponse } from '../types';

export const getUserWords = (page: number, pageSize: number) => {
  return request.get<unknown, WordListResponse>('/user-words', {
    params: { page, page_size: pageSize },
  });
};

export const addWordToNotebook = (wordId: number) => {
  return request.post<unknown, null>(`/user-words/${wordId}`);
};

export const removeWordFromNotebook = (wordId: number) => {
  return request.delete<unknown, null>(`/user-words/${wordId}`);
};

export const updateWordMasteredStatus = (wordId: number, isMastered: boolean) => {
  return request.patch<unknown, null>(`/user-words/${wordId}/status`, { is_mastered: isMastered });
};

export const getWordDetail = (wordId: number) => {
  return request.get<unknown, Word>(`/words/${wordId}`);
};