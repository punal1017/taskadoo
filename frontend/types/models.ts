export type UserRole = "ADMIN" | "MEMBER";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type ProjectStatus = "ACTIVE" | "COMPLETED" | "ON_HOLD";

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  owner: User | string;
  members: (User | string)[];
  startDate?: string;
  dueDate?: string;
  status: ProjectStatus;
  createdAt?: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  project: Project | string;
  assignedTo: User | string | null;
  assignedBy?: User | string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdAt?: string;
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  myTasks: Task[];
}

export interface AuthResult {
  user: User;
  token: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const getId = (
  value: string | { _id?: string; id?: string } | null | undefined,
): string =>
  typeof value === "string" ? value : value?._id ?? value?.id ?? "";

export const getName = (
  value: string | { name?: string } | null | undefined,
): string => (typeof value === "string" ? "" : value?.name ?? "");
