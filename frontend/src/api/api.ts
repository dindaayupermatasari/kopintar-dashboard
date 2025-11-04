// api.ts (Kode yang Diperbaiki)

import axios from "axios";

// Buat koneksi default ke backend FastAPI
const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk menambahkan token ke setiap request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token"); 

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor untuk logging (debug) - hapus di production
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

export default api;