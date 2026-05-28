import axios from 'axios';

// Cria a instância do axios com a URL base do nosso Django
const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// Interceptor: Antes de qualquer requisição sair do React, ele passa por aqui
api.interceptors.request.use(
  (config) => {
    // Busca o crachá (token) salvo no navegador
    const token = localStorage.getItem('access_token');
    
    // Se o token existir, anexa ele no cabeçalho de Autorização
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;