/**
 * Manejo centralizado de errores de red y servidor
 */

export const handleFetchError = (error, customMessage = null) => {
  console.error('Error en la petición:', error);
  
  // Error de red (servidor no responde, sin conexión, etc.)
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      userMessage: '⚠️ Error en el servidor: No se puede conectar con el servidor. Por favor, reinicie el sistema o póngase en contacto con el administrador.',
      technicalError: error.message,
      type: 'network'
    };
  }
  
  // Error de conexión
  if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
    return {
      userMessage: '⚠️ Error en el servidor: No se puede conectar con el servidor. Por favor, reinicie el sistema o póngase en contacto con el administrador.',
      technicalError: error.message,
      type: 'connection'
    };
  }
  
  // Error de timeout
  if (error.message.includes('timeout')) {
    return {
      userMessage: '⚠️ Error en el servidor: El servidor no responde. Por favor, reinicie el sistema o póngase en contacto con el administrador.',
      technicalError: error.message,
      type: 'timeout'
    };
  }
  
  // Error personalizado o genérico
  return {
    userMessage: customMessage || '⚠️ Error en el servidor: Ha ocurrido un error. Por favor, reinicie el sistema o póngase en contacto con el administrador.',
    technicalError: error.message,
    type: 'generic'
  };
};

/**
 * Wrapper para fetch con manejo de errores automático
 */
export const safeFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(30000) // 30 segundos timeout
    });
    
    // Si la respuesta no es OK, lanzar error
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }
    
    return response;
  } catch (error) {
    // Si es un error de abort por timeout
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new Error('timeout: El servidor no responde');
    }
    
    // Re-lanzar el error para que sea manejado por handleFetchError
    throw error;
  }
};

/**
 * Mostrar alerta de error al usuario
 */
export const showErrorAlert = (error, customMessage = null) => {
  const errorInfo = handleFetchError(error, customMessage);
  alert(errorInfo.userMessage);
  return errorInfo;
};
