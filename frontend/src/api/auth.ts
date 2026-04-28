import request from '../utils/request';
import type { LoginResponse } from '../types';

export const login = (username: string, password: string) => {
  return request.post<unknown, LoginResponse>('/auth/login', { username, password });
};

export const register = (username: string, password: string) => {
  return request.post<unknown, null>('/auth/register', { username, password });
};
