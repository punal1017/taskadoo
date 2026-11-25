import apiClient from "@/lib/api-client";
import type { ApiEnvelope, User } from "@/types/models";

export const getUsers = async () => {
  const { data } = await apiClient.get<ApiEnvelope<User[]>>("/users");
  return data.data;
};

export const updateUserStatus = async (id: string, isActive: boolean) => {
  const { data } = await apiClient.patch<ApiEnvelope<User>>(
    `/users/${id}/status`,
    { isActive },
  );
  return data.data;
};
