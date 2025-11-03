import axios from "axios";

// Configuração do cliente HTTP
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 segundos
});

// Interceptor de requisição (para adicionar token JWT no futuro)
apiClient.interceptors.request.use(
  (config) => {
    // TODO: Adicionar token JWT quando implementarmos autenticação
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta (para tratamento global de erros)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Tratamento de erros comuns
    if (error.response) {
      // Erro com resposta do servidor
      const status = error.response.status;
      const message = error.response.data?.message || "Erro desconhecido";

      switch (status) {
        case 401:
          console.error("Não autorizado:", message);
          // TODO: Redirecionar para login quando implementarmos autenticação
          break;
        case 403:
          console.error("Acesso negado:", message);
          break;
        case 404:
          console.error("Não encontrado:", message);
          break;
        case 500:
          console.error("Erro no servidor:", message);
          break;
        default:
          console.error("Erro:", message);
      }
    } else if (error.request) {
      // Requisição foi feita mas não houve resposta
      console.error("Erro de rede: Sem resposta do servidor");
    } else {
      // Erro na configuração da requisição
      console.error("Erro na requisição:", error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
