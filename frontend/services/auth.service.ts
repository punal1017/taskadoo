import apiClient from "@/lib/api-client";
import type { ApiEnvelope, AuthResult } from "@/types/models";

export const signIn = async (email: string, password: string) => {
  const { data } = await apiClient.post<ApiEnvelope<AuthResult>>(
    "/auth/login",
    { email, password },
  );
  return data.data;
};

export const register = async (
  name: string,
  email: string,
  password: string,
) => {
  const { data } = await apiClient.post<ApiEnvelope<AuthResult>>(
    "/auth/register",
    { name, email, password },
  );
  return data.data;
};
