
import { queryClient } from "./queryClient";

const API_BASE = import.meta.env.DEV ? "" : "";

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  try {
    const token = localStorage.getItem("auth_token");
    
    const fullUrl = url.startsWith('/api') ? `${API_BASE}${url}` : url;
    
    const response = await fetch(fullUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("auth_token");
        queryClient.clear();
        window.location.reload();
        return response;
      }
      
      // Intentar obtener el mensaje de error del servidor
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // Si no se puede parsear el JSON, usar el mensaje por defecto
      }
      
      throw new Error(errorMessage);
    }

    return response;
  } catch (error) {
    // Manejar errores de red
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión: No se puede conectar al servidor en el puerto 5000. Verifica que el servidor esté ejecutándose.');
    }
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      throw new Error('Conexión rechazada: El servidor no está respondiendo en el puerto 5000.');
    }
    throw error;
  }
}
