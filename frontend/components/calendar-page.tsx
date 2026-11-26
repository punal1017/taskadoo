"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/AddRounded";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickerDay, type PickerDayProps } from "@mui/x-date-pickers/PickerDay";
import dayjs, { type Dayjs } from "dayjs";
import { getTasks } from "@/services/task.service";
import { getErrorMessage } from "@/lib/errors";
import { ErrorState, LoadingState, PageHeader } from "@/components/shared";
import type { Task } from "@/types/models";
import { getName } from "@/types/models";

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState<Dayjs>(() => dayjs());

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

  const selectedDateKey = selectedDate.format("YYYY-MM-DD");
  const selectedTasks = useMemo(
    () => tasks.filter((task) => task.dueDate?.slice(0, 10) === selectedDateKey),
    [selectedDateKey, tasks],
  );
  const taskDates = useMemo(
    () => new Set(tasks.flatMap((task) => (task.dueDate ? [task.dueDate.slice(0, 10)] : []))),
    [tasks],
  );
  const CalendarDay = useMemo(
    () =>
      function CalendarDay(props: PickerDayProps) {
        const hasTasks = taskDates.has(dayjs(props.day).format("YYYY-MM-DD"));

        return (
          <PickerDay
            {...props}
            sx={
              hasTasks
                ? {
                    bgcolor: "action.selected",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: 4,
                      left: "50%",
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      bgcolor: props.selected ? "primary.contrastText" : "primary.main",
                      transform: "translateX(-50%)",
                    },
                  }
                : undefined
            }
          />
        );
      },
    [taskDates],
  );

  if (loading) return <LoadingState label="Loading calendar" />;
  if (error) return <ErrorState message={error} />;

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title="Calendar"
        description="Select a day to see tasks due in your workspace."
        action={<Button component={Link} href="/tasks" variant="contained" startIcon={<AddIcon />}>View tasks</Button>}
      />
      <Card>
        <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 1, md: 3 }}
            divider={<Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />}
          >
            <Box sx={{ width: { xs: "100%", md: 340 }, flexShrink: 0 }}>
              <DateCalendar
                value={selectedDate}
                onChange={(date) => {
                  if (date) setSelectedDate(date);
                }}
                slots={{ day: CalendarDay }}
              />
            </Box>
            <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0, py: { md: 2 } }}>
              <Typography sx={{ fontWeight: 650, fontSize: 16 }}>
                {selectedDate.format("dddd, MMMM D, YYYY")}
              </Typography>
              {selectedTasks.length ? (
                selectedTasks.map((task) => (
                  <Box
                    key={task._id}
                    sx={{
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{task.title}</Typography>
                    <Typography sx={{ mt: 0.5, color: "text.secondary", fontSize: 12 }}>
                      {getName(task.project)} · {task.status.replace("_", " ").toLowerCase()}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                  No tasks due on this day.
                </Typography>
              )}
            </Stack>
          </Stack>
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
