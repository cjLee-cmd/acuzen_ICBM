import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { isStaticMode, demoCases, demoCriticalCases, demoUsers, demoAiModels } from "./demoData";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// Demo data provider for static hosting
function getDemoData(endpoint: string): any {
  const path = endpoint.replace('/api', '').toLowerCase();
  
  if (path.includes('dashboard/stats')) {
    return {
      totalCases: demoCases.length,
      pendingCases: demoCases.filter(c => c.status === '검토 필요').length,
      criticalCases: demoCriticalCases.length,
      aiAccuracy: 92.3,
      systemHealth: 98.7,
    };
  } else if (path.includes('dashboard/recent-cases')) {
    return demoCases.slice(0, 5).map(c => ({
      id: c.id,
      drug: c.drugName,
      severity: c.severity,
      status: c.outcome,
      aiConfidence: c.aiPrediction?.confidence || null,
    }));
  } else if (path.includes('cases/critical')) {
    return demoCriticalCases;
  } else if (path.includes('cases')) {
    return demoCases;
  } else if (path.includes('users')) {
    return demoUsers;
  } else if (path.includes('ai-models') || path.includes('ai/models')) {
    return demoAiModels;
  } else if (path.includes('audit-logs')) {
    return []; // Empty audit logs for demo
  } else if (path.includes('monitoring')) {
    return {
      systemHealth: 98.7,
      activeUsers: 12,
      processingQueue: 3,
      apiLatency: 145,
    };
  }
  
  return null;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const endpoint = queryKey.join("/");
    
    // In static mode, return demo data instead of making API calls
    if (isStaticMode()) {
      console.log(`[Demo Mode] Serving demo data for: ${endpoint}`);
      const demoData = getDemoData(endpoint);
      if (demoData !== null) {
        return demoData;
      }
      // If no demo data available, simulate a delay and return empty array
      await new Promise(resolve => setTimeout(resolve, 500));
      return [];
    }

    const res = await fetch(endpoint, {
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
