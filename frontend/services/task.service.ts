import apiClient from "@/lib/api-client";
import type { ApiEnvelope, Task, TaskStatus } from "@/types/models";

export interface TaskInput {
  title: string;
  description?: string;
  projectId: string;
  assignedTo: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string;
}

export const getTasks = async () => {
  const { data } = await apiClient.get<ApiEnvelope<Task[]>>("/tasks");
  return data.data;
};

export const createTask = async (input: TaskInput) => {
  const { data } = await apiClient.post<ApiEnvelope<Task>>("/tasks", input);
  return data.data;
};

export const updateTask = async (
  id: string,
  input: Partial<Pick<Task, "title" | "description" | "priority" | "dueDate">>,
) => {
  const { data } = await apiClient.put<ApiEnvelope<Task>>(
    `/tasks/${id}`,
    input,
  );
  return data.data;
};

export const updateTaskStatus = async (id: string, status: TaskStatus) => {
  const { data } = await apiClient.patch<ApiEnvelope<Task>>(
    `/tasks/${id}/status`,
    { status },
  );
  return data.data;
};

export const deleteTask = async (id: string) => {
  await apiClient.delete(`/tasks/${id}`);
};
