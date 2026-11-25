"use client";

import {
  Alert,
  Avatar,
  AvatarGroup,
  Box,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import type { Project, Task, TaskPriority, TaskStatus, User } from "@/types/models";
import { getName } from "@/types/models";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{
        mb: 3.5,
        justifyContent: "space-between",
        alignItems: { xs: "stretch", sm: "center" },
      }}
    >
      <Box>
        <Typography variant="h1" sx={{ fontSize: { xs: 24, sm: 27 } }}>
          {title}
        </Typography>
        {description && (
          <Typography sx={{ mt: 0.6, color: "text.secondary", fontSize: 13 }}>
            {description}
          </Typography>
        )}
      </Box>
      {action}
    </Stack>
  );
}

export function LoadingState({ label = "Loading workspace" }: { label?: string }) {
  return (
    <Stack
      spacing={1.5}
      sx={{
        minHeight: 220,
        color: "text.secondary",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress size={24} thickness={4} />
      <Typography variant="body2">{label}…</Typography>
    </Stack>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <Alert severity="error" sx={{ borderRadius: 3 }}>
      {message}
    </Alert>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Stack
      spacing={1}
      sx={{
        minHeight: 220,
        p: 3,
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <Typography sx={{ fontWeight: 650, fontSize: 15 }}>{title}</Typography>
      <Typography sx={{ color: "text.secondary", fontSize: 13, maxWidth: 360 }}>
        {description}
      </Typography>
      {action}
    </Stack>
  );
}

const taskStatusLabels: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

const projectStatusLabels = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  ON_HOLD: "On hold",
};

export function StatusChip({
  status,
}: {
  status: TaskStatus | Project["status"];
}) {
  const styles: Record<string, { color: string; background: string }> = {
    TODO: { color: "#737B8C", background: "#F0F1F4" },
    IN_PROGRESS: { color: "#5385D8", background: "#EDF3FC" },
    COMPLETED: { color: "#269B73", background: "#EAF7F1" },
    ACTIVE: { color: "#5385D8", background: "#EDF3FC" },
    ON_HOLD: { color: "#D99A35", background: "#FFF6E7" },
  };
  const label =
    status in taskStatusLabels
      ? taskStatusLabels[status as TaskStatus]
      : projectStatusLabels[status as keyof typeof projectStatusLabels] ?? status;
  const colors = styles[status] ?? styles.TODO;
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: 1.1,
        py: 0.45,
        borderRadius: 999,
        color: colors.color,
        bgcolor: colors.background,
        fontWeight: 600,
        fontSize: 11,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Box>
  );
}

export function PriorityChip({ priority }: { priority: TaskPriority }) {
  const colors: Record<TaskPriority, { color: string; bg: string }> = {
    LOW: { color: "#737B8C", bg: "#F0F1F4" },
    MEDIUM: { color: "#B87C20", bg: "#FFF6E7" },
    HIGH: { color: "#C34D57", bg: "#FCEEEF" },
  };
  return (
    <Box
      component="span"
      sx={{
        color: colors[priority].color,
        bgcolor: colors[priority].bg,
        borderRadius: 999,
        px: 1,
        py: 0.4,
        fontSize: 10.5,
        fontWeight: 700,
      }}
    >
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </Box>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  icon,
  tint = "#EEF1FF",
  iconColor = "#4F6BED",
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: ReactNode;
  tint?: string;
  iconColor?: string;
}) {
  return (
    <Card>
      <CardContent sx={{ p: "20px !important" }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography sx={{ color: "text.secondary", fontSize: 12.5, fontWeight: 550 }}>
              {label}
            </Typography>
            <Typography sx={{ mt: 1.25, fontSize: 28, lineHeight: 1, fontWeight: 700 }}>
              {value}
            </Typography>
            {hint && (
              <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 11.5 }}>
                {hint}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              color: iconColor,
              bgcolor: tint,
              "& .MuiSvgIcon-root": { fontSize: 20 },
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function MemberAvatars({ members }: { members: (User | string)[] }) {
  if (!members.length) {
    return (
      <Typography sx={{ color: "text.secondary", fontSize: 11.5 }}>
        No members
      </Typography>
    );
  }
  return (
    <AvatarGroup
      max={4}
      sx={{
        justifyContent: "flex-end",
        "& .MuiAvatar-root": {
          width: 27,
          height: 27,
          border: "2px solid #fff",
          fontSize: 10,
          color: "#465FDB",
          bgcolor: "#E6EAFE",
        },
      }}
    >
      {members.map((member, index) => {
        const name = getName(member) || `Member ${index + 1}`;
        return <Avatar key={typeof member === "string" ? member : member._id ?? name}>{name.slice(0, 1).toUpperCase()}</Avatar>;
      })}
    </AvatarGroup>
  );
}

export function ProjectProgress({
  project,
  tasks,
}: {
  project: Project;
  tasks: Task[];
}) {
  const projectTasks = tasks.filter((task) => {
    const projectId = typeof task.project === "string" ? task.project : task.project?._id;
    return projectId === project._id;
  });
  const complete = projectTasks.filter((task) => task.status === "COMPLETED").length;
  const progress = projectTasks.length
    ? Math.round((complete / projectTasks.length) * 100)
    : 0;
  return (
    <Stack spacing={0.8}>
      <Stack direction="row" sx={{ justifyContent: "space-between" }}>
        <Typography sx={{ color: "text.secondary", fontSize: 11.5 }}>
          {projectTasks.length} {projectTasks.length === 1 ? "task" : "tasks"}
        </Typography>
        <Typography sx={{ fontSize: 11.5, fontWeight: 600 }}>{progress}%</Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 5,
          borderRadius: 5,
          bgcolor: "#EEF0F5",
          "& .MuiLinearProgress-bar": { borderRadius: 5 },
        }}
      />
    </Stack>
  );
}

export const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: new Date(value).getFullYear() === new Date().getFullYear() ? undefined : "numeric",
      }).format(new Date(value))
    : "No due date";

export const isOverdue = (value?: string) =>
  Boolean(value && new Date(value).getTime() < new Date().setHours(0, 0, 0, 0));
