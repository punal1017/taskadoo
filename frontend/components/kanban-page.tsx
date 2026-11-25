"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/AddRounded";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import { useAuth } from "@/components/providers";
import {
  ErrorState,
  formatDate,
  isOverdue,
  LoadingState,
  PageHeader,
  PriorityChip,
  StatusChip,
} from "@/components/shared";
import { getTasks, updateTaskStatus } from "@/services/task.service";
import { getErrorMessage } from "@/lib/errors";
import type { Task, TaskStatus } from "@/types/models";
import { getName } from "@/types/models";
import useGlobalQuery from "@/lib/use-global-query";

const columns: { status: TaskStatus; label: string; tone: string }[] = [
  { status: "TODO", label: "To do", tone: "#8A91A0" },
  { status: "IN_PROGRESS", label: "In progress", tone: "#5385D8" },
  { status: "COMPLETED", label: "Completed", tone: "#269B73" },
];

export default function KanbanPage() {
  const { user } = useAuth();
  const query = useGlobalQuery().toLowerCase();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getTasks()
      .then((items) => active && setTasks(items))
      .catch((requestError: unknown) => active && setError(getErrorMessage(requestError)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      tasks.filter((task) =>
        `${task.title} ${task.description ?? ""} ${getName(task.project)} ${getName(task.assignedTo)}`
          .toLowerCase()
          .includes(query),
      ),
    [query, tasks],
  );

  const moveTask = async (taskId: string, status: TaskStatus) => {
    const task = tasks.find((item) => item._id === taskId);
    if (!task || task.status === status) return;
    setTasks((items) => items.map((item) => item._id === taskId ? { ...item, status } : item));
    setNotice("");
    try {
      await updateTaskStatus(taskId, status);
    } catch (requestError) {
      setTasks((items) => items.map((item) => item._id === taskId ? { ...item, status: task.status } : item));
      setNotice(getErrorMessage(requestError));
    }
  };

  if (loading) return <LoadingState label="Loading board" />;
  if (error) return <ErrorState message={error} />;

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title="Kanban board"
        description="Move work through the statuses supported by your workspace."
        action={user?.role === "ADMIN" ? <Button component={Link} href="/tasks?create=1" variant="contained" startIcon={<AddIcon />}>New task</Button> : undefined}
      />
      {notice && <Alert severity="error" onClose={() => setNotice("")}>{notice}</Alert>}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 2, alignItems: "start" }}>
        {columns.map((column) => {
          const items = filtered.filter((task) => task.status === column.status);
          return (
            <Box
              key={column.status}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (dragging) moveTask(dragging, column.status);
                setDragging(null);
              }}
              sx={{
                minHeight: 420,
                p: 1.4,
                border: "1px solid",
                borderColor: dragging ? "#C8D1FF" : "divider",
                borderRadius: 3.5,
                bgcolor: dragging ? "#F0F3FF" : "#F2F4F8",
                transition: "background-color 160ms ease, border-color 160ms ease",
              }}
            >
              <Stack direction="row" sx={{ px: 0.4, mb: 1.5, alignItems: "center", justifyContent: "space-between" }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: column.tone }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 650 }}>{column.label}</Typography>
                </Stack>
                <Chip size="small" label={items.length} sx={{ height: 23, minWidth: 27, fontSize: 11, bgcolor: "#fff", border: "1px solid #E8EAF0" }} />
              </Stack>
              <Stack spacing={1.2}>
                {items.map((task) => (
                  <Card
                    key={task._id}
                    draggable
                    onDragStart={() => setDragging(task._id)}
                    onDragEnd={() => setDragging(null)}
                    sx={{
                      cursor: "grab",
                      opacity: dragging === task._id ? 0.5 : 1,
                      transition: "transform 160ms ease, box-shadow 160ms ease",
                      "&:hover": { transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(32,37,50,.08)" },
                      "&:active": { cursor: "grabbing" },
                    }}
                  >
                    <CardContent sx={{ p: "15px !important" }}>
                      <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Typography sx={{ fontWeight: 650, fontSize: 13, lineHeight: 1.45 }}>{task.title}</Typography>
                        <StatusChip status={task.status} />
                      </Stack>
                      {task.description && (
                        <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 11.5, lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {task.description}
                        </Typography>
                      )}
                      <Stack direction="row" sx={{ mt: 1.7, alignItems: "center", justifyContent: "space-between" }}>
                        <PriorityChip priority={task.priority} />
                        <Stack direction="row" spacing={0.6} sx={{ alignItems: "center" }}>
                          <CalendarTodayOutlinedIcon sx={{ color: task.dueDate && isOverdue(task.dueDate) && task.status !== "COMPLETED" ? "error.main" : "text.secondary", fontSize: 14 }} />
                          <Typography sx={{ color: task.dueDate && isOverdue(task.dueDate) && task.status !== "COMPLETED" ? "error.main" : "text.secondary", fontSize: 10.5 }}>
                            {formatDate(task.dueDate)}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Stack direction="row" spacing={0.8} sx={{ mt: 1.6, alignItems: "center" }}>
                        <Avatar sx={{ width: 23, height: 23, fontSize: 9.5, color: "#465FDB", bgcolor: "#E6EAFE" }}>
                          {getName(task.assignedTo).slice(0, 1).toUpperCase() || "?"}
                        </Avatar>
                        <Typography noWrap sx={{ color: "text.secondary", fontSize: 11 }}>
                          {getName(task.project) || "Project"}
                        </Typography>
                        <Typography noWrap sx={{ ml: "auto !important", color: "text.secondary", fontSize: 11 }}>
                          {getName(task.assignedTo)}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
                {!items.length && (
                  <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
                    <Typography sx={{ fontSize: 12 }}>{query ? "No matching tasks" : "Drop tasks here"}</Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
}
