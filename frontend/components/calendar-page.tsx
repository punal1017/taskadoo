"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import AddIcon from "@mui/icons-material/AddRounded";
import { getTasks } from "@/services/task.service";
import { getErrorMessage } from "@/lib/errors";
import { ErrorState, LoadingState, PageHeader } from "@/components/shared";
import type { Task } from "@/types/models";
import { getName } from "@/types/models";

const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));

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

  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [month]);

  const tasksByDate = useMemo(() => {
    const grouped = new Map<string, Task[]>();
    for (const task of tasks) {
      if (!task.dueDate) continue;
      const key = dayKey(new Date(task.dueDate));
      grouped.set(key, [...(grouped.get(key) ?? []), task]);
    }
    return grouped;
  }, [tasks]);

  if (loading) return <LoadingState label="Loading calendar" />;
  if (error) return <ErrorState message={error} />;

  const monthLabel = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(month);
  const todayKey = dayKey(new Date());

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title="Calendar"
        description="A month view of task due dates in your workspace."
        action={<Button component={Link} href="/tasks" variant="contained" startIcon={<AddIcon />}>View tasks</Button>}
      />
      <Card>
        <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
            <Typography sx={{ fontWeight: 650, fontSize: 16 }}>{monthLabel}</Typography>
            <Stack direction="row" spacing={0.75}>
              <Button size="small" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} startIcon={<ArrowBackIosNewRoundedIcon sx={{ fontSize: "13px !important" }} />}>Previous</Button>
              <Button size="small" onClick={() => setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>Today</Button>
              <Button size="small" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} endIcon={<ArrowForwardIosRoundedIcon sx={{ fontSize: "13px !important" }} />}>Next</Button>
            </Stack>
          </Stack>

          <Box sx={{ overflowX: "auto" }}>
            <Box sx={{ minWidth: 700, display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", borderTop: "1px solid #E8EAF0", borderLeft: "1px solid #E8EAF0" }}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <Box key={day} sx={{ py: 1, textAlign: "center", color: "text.secondary", fontSize: 11, fontWeight: 650, borderRight: "1px solid #E8EAF0", borderBottom: "1px solid #E8EAF0", bgcolor: "#FAFBFD" }}>
                  {day}
                </Box>
              ))}
              {days.map((date) => {
                const dateTasks = tasksByDate.get(dayKey(date)) ?? [];
                const inMonth = date.getMonth() === month.getMonth();
                return (
                  <Box
                    key={dayKey(date)}
                    sx={{
                      minHeight: 112,
                      p: 0.9,
                      borderRight: "1px solid #E8EAF0",
                      borderBottom: "1px solid #E8EAF0",
                      bgcolor: inMonth ? "#fff" : "#FAFBFD",
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 0.7 }}>
                      <Typography
                        sx={{
                          width: 25,
                          height: 25,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: "50%",
                          fontSize: 11,
                          fontWeight: dayKey(date) === todayKey ? 700 : 500,
                          color: dayKey(date) === todayKey ? "#fff" : inMonth ? "text.primary" : "text.disabled",
                          bgcolor: dayKey(date) === todayKey ? "primary.main" : "transparent",
                        }}
                      >
                        {date.getDate()}
                      </Typography>
                    </Box>
                    <Stack spacing={0.5}>
                      {dateTasks.slice(0, 3).map((task) => (
                        <Box
                          key={task._id}
                          title={`${task.title} · ${getName(task.project)}`}
                          sx={{
                            px: 0.65,
                            py: 0.4,
                            borderRadius: 1,
                            overflow: "hidden",
                            bgcolor: task.status === "COMPLETED" ? "#EAF7F1" : task.status === "IN_PROGRESS" ? "#EDF3FC" : "#F0F1F4",
                            color: task.status === "COMPLETED" ? "#269B73" : task.status === "IN_PROGRESS" ? "#5385D8" : "#737B8C",
                          }}
                        >
                          <Typography noWrap sx={{ fontSize: 10, fontWeight: 600 }}>{task.title}</Typography>
                        </Box>
                      ))}
                      {dateTasks.length > 3 && (
                        <Typography sx={{ pl: 0.5, color: "text.secondary", fontSize: 9.5 }}>+{dateTasks.length - 3} more</Typography>
                      )}
                    </Stack>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </CardContent>
      </Card>
      {tasks.every((task) => !task.dueDate) && (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          No tasks have due dates yet. Add a due date to a task to see it on the calendar.
        </Alert>
      )}
    </Stack>
  );
}
