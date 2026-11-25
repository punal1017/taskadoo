"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import { EmptyState, ErrorState, formatDate, LoadingState, PageHeader, PriorityChip, StatusChip } from "@/components/shared";
import { getProject } from "@/services/project.service";
import { getTasks } from "@/services/task.service";
import { getErrorMessage } from "@/lib/errors";
import type { Project, Task } from "@/types/models";
import { getName } from "@/types/models";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getProject(projectId), getTasks()])
      .then(([nextProject, nextTasks]) => {
        if (!active) return;
        setProject(nextProject);
        setTasks(nextTasks);
      })
      .catch((requestError: unknown) => active && setError(getErrorMessage(requestError)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [projectId]);

  const projectTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const id = typeof task.project === "string" ? task.project : task.project?._id;
        return id === projectId;
      }),
    [projectId, tasks],
  );

  if (loading) return <LoadingState label="Loading project" />;
  if (error) return <ErrorState message={error} />;
  if (!project) return <ErrorState message="Project could not be found." />;

  return (
    <Stack spacing={2.5}>
      <Button component={Link} href="/projects" startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: "flex-start", color: "text.secondary" }}>
        All projects
      </Button>
      <PageHeader title={project.name} description={project.description || "Project workspace and task overview."} action={<StatusChip status={project.status} />} />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.5fr) minmax(260px, .7fr)" }, gap: 2 }}>
        <Card>
          <CardContent sx={{ p: "22px !important" }}>
            <Stack direction="row" sx={{ mb: 1.5, justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="h3">Project tasks</Typography>
                <Typography sx={{ mt: 0.4, color: "text.secondary", fontSize: 12 }}>
                  {projectTasks.length} {projectTasks.length === 1 ? "task" : "tasks"} in this project
                </Typography>
              </Box>
              <Button component={Link} href="/tasks">Open tasks</Button>
            </Stack>
            {projectTasks.length ? (
              <Stack divider={<Divider flexItem />} spacing={0}>
                {projectTasks.map((task) => (
                  <Stack key={task._id} direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ py: 1.7, alignItems: { xs: "flex-start", sm: "center" } }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{task.title}</Typography>
                      <Typography sx={{ mt: 0.4, color: "text.secondary", fontSize: 11.5 }}>
                        Assigned to {getName(task.assignedTo) || "team member"}
                      </Typography>
                    </Box>
                    <PriorityChip priority={task.priority} />
                    <StatusChip status={task.status} />
                    <Typography sx={{ minWidth: 80, color: "text.secondary", fontSize: 11.5 }}>
                      {formatDate(task.dueDate)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            ) : (
              <EmptyState title="No tasks in this project" description="Tasks associated with this project will show up here." />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ p: "22px !important" }}>
            <Typography variant="h3">Project details</Typography>
            <Stack spacing={2.3} sx={{ mt: 2.5 }}>
              <Stack direction="row" spacing={1.2}>
                <CalendarTodayOutlinedIcon sx={{ color: "text.secondary", fontSize: 18 }} />
                <Box>
                  <Typography sx={{ color: "text.secondary", fontSize: 11.5 }}>TIMELINE</Typography>
                  <Typography sx={{ mt: 0.35, fontSize: 12.5 }}>
                    {formatDate(project.startDate)} – {formatDate(project.dueDate)}
                  </Typography>
                </Box>
              </Stack>
              <Divider />
              <Box>
                <Typography sx={{ mb: 1.2, color: "text.secondary", fontSize: 11.5 }}>TEAM MEMBERS</Typography>
                <Stack spacing={1.1}>
                  {(project.members ?? []).map((member, index) => {
                    const name = typeof member === "string" ? "Project member" : member.name;
                    const email = typeof member === "string" ? "" : member.email;
                    return (
                      <Stack key={typeof member === "string" ? member : member._id ?? index} direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <Avatar sx={{ width: 29, height: 29, fontSize: 10, bgcolor: "#E6EAFE", color: "#465FDB" }}>{name.slice(0, 1).toUpperCase()}</Avatar>
                        <Box>
                          <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{name}</Typography>
                          {email && <Typography sx={{ color: "text.secondary", fontSize: 10.5 }}>{email}</Typography>}
                        </Box>
                      </Stack>
                    );
                  })}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}
