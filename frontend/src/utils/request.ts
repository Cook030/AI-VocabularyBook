import axios from 'axios';

// 1. 创建实例
const request = axios.create({
  // 开发环境下使用代理前缀 /api，生产环境使用实际域名
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
});

// 2. 请求拦截：每个请求发出前，自动塞入 Token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// 3. 响应拦截：处理后端 response.go 返回的统一格式
request.interceptors.response.use(
  (response) => {
    const res = response.data; // 后端返回的 { code, data, msg }

    // 如果业务状态码不是 200，说明有业务错误
    if (res.code !== 200) {
      if (res.code === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(new Error(res.msg || '未知错误'));
    }

    // 成功则直接返回 data 部分，让页面调用处少写一层 .data
    return res.data;
  },
  (error) => {
    // 处理 HTTP 状态码错误（如 401, 500）
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default request;