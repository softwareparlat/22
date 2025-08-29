import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { apiRequest } from "@/lib/api";
import type { User } from "@shared/schema";
import type { DashboardStats } from "@/types";

export function useAdmin() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch admin stats");
      }
      return await response.json();
    },
    enabled: user?.role === "admin",
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return await response.json();
    },
    enabled: user?.role === "admin",
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  return {
    stats: stats as DashboardStats | undefined,
    users: users as User[] | undefined,
    isLoading: statsLoading || usersLoading,
    error: statsError || usersError,
  };
}
