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

  if(typeof data === 'string') return data;
  // ASP.NET Core validation errors
  if (data && typeof data === "object") {
    let messages = [];
    const list = Object.values(data).flat();
    for (let index = 0; index < list.length; index++) {
      const element: any = list[index];
      if(typeof element == "string") messages.push(element);
      if(typeof element == "object" && element.description) messages.push(element.description);
    }
    if (messages.length > 0) return messages.join(" ");
  }

  // Normalize error message
  return err?.message || err?.error || data?.message || data?.error || data?.title || "Something went wrong.";
}


export default api;
