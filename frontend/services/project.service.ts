import apiClient from "@/lib/api-client";
import type { ApiEnvelope, Project } from "@/types/models";

export interface ProjectInput {
  name: string;
  description?: string;
  startDate?: string;
  dueDate?: string;
}

export const getProjects = async () => {
  const { data } = await apiClient.get<ApiEnvelope<Project[]>>("/projects");
  return data.data;
};

export const getProject = async (id: string) => {
  const { data } = await apiClient.get<ApiEnvelope<Project>>(`/projects/${id}`);
  return data.data;
};

export const createProject = async (input: ProjectInput) => {
  const { data } = await apiClient.post<ApiEnvelope<Project>>(
    "/projects",
    input,
  );
  return data.data;
};

export const updateProject = async (id: string, input: ProjectInput) => {
  const { data } = await apiClient.put<ApiEnvelope<Project>>(
    `/projects/${id}`,
    input,
  );
  return data.data;
};

export const deleteProject = async (id: string) => {
  await apiClient.delete(`/projects/${id}`);
};

export const addProjectMember = async (projectId: string, userId: string) => {
  const { data } = await apiClient.post<ApiEnvelope<Project>>(
    `/projects/${projectId}/members`,
    { userId },
  );
  return data.data;
};

export const removeProjectMember = async (
  projectId: string,
  userId: string,
) => {
  const { data } = await apiClient.delete<ApiEnvelope<Project>>(
    `/projects/${projectId}/members/${userId}`,
  );
  return data.data;
};
