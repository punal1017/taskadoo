import apiClient from "@/lib/api-client";
import type { ApiEnvelope, DashboardStats } from "@/types/models";

export const getDashboardStats = async () => {
  const { data } =
    await apiClient.get<ApiEnvelope<DashboardStats>>("/dashboard/stats");
  return data.data;
};
