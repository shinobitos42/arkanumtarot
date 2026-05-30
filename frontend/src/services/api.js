import axios from 'axios';

// Puxa a URL limpa do .env, se não achar, usa o localhost padrão
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

// Cria a instância do axios com a URL dinâmica
const api = axios.create({
  baseURL: apiUrl,
});

// Interceptor de REQUEST: Anexa o crachá
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

// Interceptor de RESPONSE (O Dedo Duro do Frontend)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 400) {
      console.error("⛔ O DJANGO RECUSOU OS DADOS! Motivo exato:", error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api;