import axios from 'axios';

// Puxa a URL limpa do .env, se não achar, usa o localhost padrão
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: apiUrl,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // AGORA ELE VAI IMPRIMIR O MOTIVO EXATO DE QUALQUER ERRO!
    if (error.response) {
      console.error(`⛔ ERRO ${error.response.status} DO DJANGO:`, error.response.data);
    } else {
      console.error("⛔ ERRO DE CONEXÃO (O backend pode estar fora do ar):", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;