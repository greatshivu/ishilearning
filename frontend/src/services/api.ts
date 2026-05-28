import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5052') +"/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Dispatch event for progress overlay
  window.dispatchEvent(new CustomEvent('api-request-start'));
  
  return config;
});

api.interceptors.response.use(
  (response) => {
    window.dispatchEvent(new CustomEvent('api-request-end'));
    return response;
  },
  (error) => {
    window.dispatchEvent(new CustomEvent('api-request-end'));
    error.readableMessage = extractErrors(error);
    return Promise.reject(error);
  }
);

function extractErrors(err: any) {
  const data = err.response?.data;

  // ASP.NET Core validation errors
  if (data && typeof data === "object") {
    const messages = Object.values(data)
      .flat()
      .filter(x => typeof x === "string");

    if (messages.length > 0) return messages.join(" ");
  }

  return "Something went wrong.";
}


export default api;
