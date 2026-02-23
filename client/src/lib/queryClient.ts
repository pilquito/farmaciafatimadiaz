import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      // Intentar obtener el mensaje de error del cuerpo de la respuesta
      const contentType = res.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else {
        errorMessage = await res.text() || errorMessage;
      }
    } catch (parseError) {
      console.error('Error parsing error response:', parseError);
      // Usar statusText como fallback
    }
    throw new Error(`${res.status}: ${errorMessage}`);
  }
}

export async function apiRequest(
  url: string,
  options?: RequestInit & { body?: any },
): Promise<any> {
  const { body, ...restOptions } = options || {};
  
  const res = await fetch(url, {
    credentials: "include",
    ...restOptions,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...options?.headers,
    }
  });

  await throwIfResNotOk(res);
  
  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    try {
      const jsonData = await res.json();
      console.log('JSON parsed successfully:', jsonData);
      return jsonData;
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      // Si no se puede parsear como JSON, intentar obtener como texto
      const textData = await res.text();
      console.log('Response as text:', textData);
      throw new Error(`Response could not be parsed as JSON: ${textData}`);
    }
  }
  
  console.log('Response is not JSON, returning raw response');
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
