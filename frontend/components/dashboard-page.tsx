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
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/AddRounded";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import TimelapseOutlinedIcon from "@mui/icons-material/TimelapseOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardRounded";
import { useAuth } from "@/components/providers";
import {
  EmptyState,
  ErrorState,
  formatDate,
  LoadingState,
  MemberAvatars,
  MetricCard,
  PageHeader,
  PriorityChip,
  ProjectProgress,
  StatusChip,
} from "@/components/shared";
import { getDashboardStats } from "@/services/dashboard.service";
import { getProjects } from "@/services/project.service";
import { getTasks } from "@/services/task.service";
import { getErrorMessage } from "@/lib/errors";
import type { DashboardStats, Project, Task } from "@/types/models";
import { getName } from "@/types/models";
import useGlobalQuery from "@/lib/use-global-query";

export default function DashboardPage() {
  const { user } = useAuth();
  const query = useGlobalQuery().toLowerCase();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getDashboardStats(), getProjects(), getTasks()])
      .then(([nextStats, nextProjects, nextTasks]) => {
        if (!active) return;
        setStats(nextStats);
        setProjects(nextProjects);
        setTasks(nextTasks);
      })
      .catch((requestError: unknown) => {
        if (active) setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredProjects = useMemo(
    () =>
      projects
        .filter((project) =>
          `${project.name} ${project.description ?? ""}`.toLowerCase().includes(query),
        )
        .slice(0, 4),
    [projects, query],
  );
  const filteredTasks = useMemo(
    () =>
      (stats?.myTasks ?? tasks)
        .filter((task) =>
          `${task.title} ${getName(task.project)}`.toLowerCase().includes(query),
        )
        .slice(0, 5),
    [query, stats, tasks],
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!stats) return <ErrorState message="Dashboard data could not be loaded." />;

  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 18
        ? "Good afternoon"
        : "Good evening";

  return (
    <Stack spacing={3.5}>
      <PageHeader
        title={`${greeting}, ${user?.name.split(" ")[0] ?? "there"}`}
        description="Here’s an overview of your team’s work and what needs your attention."
        action={
          user?.role === "ADMIN" ? (
            <Button
              component={Link}
              href="/projects?create=1"
              variant="contained"
              startIcon={<AddIcon />}
            >
              Create project
            </Button>
          ) : undefined
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            label="Total projects"
            value={stats.totalProjects}
            hint="Projects you can access"
            icon={<FolderOutlinedIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            label="Total tasks"
            value={stats.totalTasks}
            hint="Across your workspace"
            icon={<AssignmentOutlinedIcon />}
            tint="#EDF3FC"
            iconColor="#5385D8"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            label="In progress"
            value={stats.inProgressTasks}
            hint={`${stats.pendingTasks} waiting to start`}
            icon={<TimelapseOutlinedIcon />}
            tint="#FFF6E7"
            iconColor="#D99A35"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            label="Completed"
            value={stats.completedTasks}
            hint="Tasks marked complete"
            icon={<CheckCircleOutlineIcon />}
            tint="#EAF7F1"
            iconColor="#269B73"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: "22px !important" }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box>
                  <Typography variant="h3">Recent projects</Typography>
                  <Typography sx={{ mt: 0.4, color: "text.secondary", fontSize: 12 }}>
                    Keep an eye on work moving across your team
                  </Typography>
                </Box>
                <Button component={Link} href="/projects" endIcon={<ArrowForwardIcon />} size="small">
                  View all
                </Button>
              </Stack>
              {filteredProjects.length ? (
                <Stack divider={<Divider flexItem />} spacing={0}>
                  {filteredProjects.map((project) => (
                    <Stack
                      key={project._id}
                      direction={{ xs: "column", sm: "row" }}
                      spacing={2}
                      sx={{ py: 1.8, alignItems: { xs: "stretch", sm: "center" } }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <Typography
                            component={Link}
                            href={`/projects/${project._id}`}
                            sx={{ fontWeight: 650, fontSize: 13.5, "&:hover": { color: "primary.main" } }}
                          >
                            {project.name}
                          </Typography>
                          <StatusChip status={project.status} />
                        </Stack>
                        <Typography noWrap sx={{ mt: 0.55, color: "text.secondary", fontSize: 11.5 }}>
                          {project.description || "No project description"}
                        </Typography>
                        <Box sx={{ mt: 1.4, maxWidth: 280 }}>
                          <ProjectProgress project={project} tasks={tasks} />
                        </Box>
                      </Box>
                      <MemberAvatars members={project.members ?? []} />
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <EmptyState
                  title={query ? "No matching projects" : "No projects yet"}
                  description={query ? "Try another search." : "Projects you can access will appear here."}
                  action={
                    user?.role === "ADMIN" && !query ? (
                      <Button component={Link} href="/projects?create=1" size="small">Create a project</Button>
                    ) : undefined
                  }
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: "22px !important" }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box>
                  <Typography variant="h3">My tasks</Typography>
                  <Typography sx={{ mt: 0.4, color: "text.secondary", fontSize: 12 }}>
                    Your most recent assignments
                  </Typography>
                </Box>
                <Button component={Link} href="/tasks" endIcon={<ArrowForwardIcon />} size="small">
                  All tasks
                </Button>
              </Stack>
              {filteredTasks.length ? (
                <Stack divider={<Divider flexItem />} spacing={0}>
                  {filteredTasks.map((task) => (
                    <Stack key={task._id} spacing={0.85} sx={{ py: 1.55 }}>
                      <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between" }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 13, minWidth: 0 }}>
                          {task.title}
                        </Typography>
                        <StatusChip status={task.status} />
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
                        <Typography noWrap sx={{ color: "text.secondary", fontSize: 11.5 }}>
                          {getName(task.project) || "Project"}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <PriorityChip priority={task.priority} />
                          <Typography sx={{ color: "text.secondary", fontSize: 11 }}>
                            {formatDate(task.dueDate)}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <EmptyState
                  title={query ? "No matching tasks" : "All clear"}
                  description={query ? "Try a different search term." : "Tasks assigned to you will show up here."}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {projects.length === 0 && tasks.length === 0 && (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          Your workspace is ready. Create a project to get started.
        </Alert>
      )}
    </Stack>
  );
}
