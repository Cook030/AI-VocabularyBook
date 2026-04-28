import type { User } from '../types';

export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const setStoredUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const clearAuth = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};