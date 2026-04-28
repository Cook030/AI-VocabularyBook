export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  msg: string;
}

export interface User {
  id: number;
  username: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export type AIModel = 'qwen-plus' | 'qwen-max' | 'qwen-turbo' | 'deepseek-v3' | string;

export interface WordDefinition {
  pos: string;
  meanings: string[];
}

export interface Word {
  id: number;
  word: string;
  translation: string;
  definitions?: WordDefinition[];
  example_sentence: string;
  example_translation: string;
  synonyms: string[] | string;
  is_mastered?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WordSearchParams {
  word: string;
  model?: AIModel;
}

export interface SearchResult {
  word: Word;
  is_saved: boolean;
}

export interface WordListResponse {
  list: Word[];
  total: number;
  page?: number;
  page_size?: number;
}

export interface UpdateUserWordStatusRequest {
  is_mastered: boolean;
}
