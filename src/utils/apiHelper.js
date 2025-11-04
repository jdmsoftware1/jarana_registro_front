// Helper para llamadas a la API con autenticación
export const apiCall = async (endpoint, options = {}) => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  
  // Asegurar que no hay doble /api/
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `${baseURL}/${cleanEndpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
  };
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem('authToken');
        window.location.href = '/admin-login';
        throw new Error('Sesión expirada. Redirigiendo al login...');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Métodos específicos para diferentes tipos de llamadas
export const apiGet = (endpoint) => apiCall(endpoint, { method: 'GET' });

export const apiPost = (endpoint, data) => apiCall(endpoint, {
  method: 'POST',
  body: JSON.stringify(data)
});

export const apiPut = (endpoint, data) => apiCall(endpoint, {
  method: 'PUT',
  body: JSON.stringify(data)
});

export const apiDelete = (endpoint) => apiCall(endpoint, { method: 'DELETE' });

export const apiPatch = (endpoint, data) => apiCall(endpoint, {
  method: 'PATCH',
  body: JSON.stringify(data)
});
