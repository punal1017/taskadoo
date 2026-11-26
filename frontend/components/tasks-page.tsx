"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import AddIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useAuth } from "@/components/providers";
import {
  EmptyState,
  ErrorState,
  formatDate,
  isOverdue,
  LoadingState,
  PageHeader,
  PriorityChip,
} from "@/components/shared";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
  updateTaskStatus,
} from "@/services/task.service";
import { getProjects } from "@/services/project.service";
import { getUsers } from "@/services/user.service";
import { getErrorMessage } from "@/lib/errors";
import type { Project, Task, TaskPriority, TaskStatus, User } from "@/types/models";
import { getId, getName } from "@/types/models";
import useGlobalQuery from "@/lib/use-global-query";
import DateField from "@/components/date-field";

type TaskForm = {
  title: string;
  description: string;
  projectId: string;
  assignedTo: string;
  priority: TaskPriority;
  dueDate: string;
};

const initialForm: TaskForm = {
  title: "",
  description: "",
  projectId: "",
  assignedTo: "",
  priority: "MEDIUM",
  dueDate: "",
};

const statuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "COMPLETED"];

export default function TasksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdmin = user?.role === "ADMIN";
  const createRequested = isAdmin && searchParams.get("create") === "1";
  const query = useGlobalQuery().toLowerCase();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeError, setNoticeError] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<TaskForm>(initialForm);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const refresh = async () => setTasks(await getTasks());

  useEffect(() => {
    let active = true;
    Promise.all([
      getTasks(),
      isAdmin ? getProjects() : Promise.resolve([] as Project[]),
      isAdmin ? getUsers() : Promise.resolve([] as User[]),
    ])
      .then(([nextTasks, nextProjects, nextUsers]) => {
        if (!active) return;
        setTasks(nextTasks);
        setProjects(nextProjects);
        setUsers(nextUsers.filter((item) => item.isActive && item.role === "MEMBER"));
        if (createRequested) {
          const defaultProject = nextProjects[0];
          const defaultAssignee = nextUsers.find(
            (member) =>
              member.isActive &&
              member.role === "MEMBER" &&
              defaultProject?.members.some(
                (projectMember) => getId(projectMember) === getId(member),
              ),
          );
          setForm({
            ...initialForm,
            projectId: defaultProject?._id ?? "",
            assignedTo: defaultAssignee ? getId(defaultAssignee) : "",
          });
        }
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
  }, [createRequested, isAdmin]);

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) =>
        `${task.title} ${task.description ?? ""} ${getName(task.project)} ${getName(task.assignedTo)}`
          .toLowerCase()
          .includes(query),
      ),
    [query, tasks],
  );

  const selectedProject = projects.find((project) => project._id === form.projectId);
  const assignableUsers = users.filter((member) =>
    selectedProject?.members.some((projectMember) => getId(projectMember) === getId(member)),
  );
  const currentAssigneeId = editing ? getId(editing.assignedTo) : "";

  const openCreate = () => {
    setEditing(null);
    const project = projects[0];
    const assignedMember = users.find((member) =>
      project?.members.some((projectMember) => getId(projectMember) === getId(member)),
    );
    setForm({
      ...initialForm,
      projectId: project?._id ?? "",
      assignedTo: assignedMember ? getId(assignedMember) : "",
    });
    setOpen(true);
  };

  const closeTaskDialog = () => {
    setOpen(false);
    if (createRequested) router.replace("/tasks");
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setForm({
      title: task.title,
      description: task.description ?? "",
      projectId: getId(task.project),
      assignedTo: getId(task.assignedTo),
      priority: task.priority,
      dueDate: task.dueDate?.slice(0, 10) ?? "",
    });
    setOpen(true);
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      if (editing) {
        await updateTask(editing._id, {
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          priority: form.priority,
          dueDate: form.dueDate || undefined,
          assignedTo:
            form.assignedTo === getId(editing.assignedTo)
              ? undefined
              : form.assignedTo || null,
        });
        setNoticeError(false);
        setNotice("Task updated.");
      } else {
        await createTask({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          projectId: form.projectId,
          assignedTo: form.assignedTo,
          priority: form.priority,
          dueDate: form.dueDate || undefined,
        });
        setNoticeError(false);
        setNotice("Task created.");
      }
      await refresh();
      closeTaskDialog();
    } catch (requestError) {
      setNoticeError(true);
      setNotice(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (task: Task, status: TaskStatus) => {
    try {
      const updated = await updateTaskStatus(task._id, status);
      setTasks((current) => current.map((item) => item._id === task._id ? { ...item, status: updated.status } : item));
      setNotice("");
      setNoticeError(false);
    } catch (requestError) {
      setNoticeError(true);
      setNotice(getErrorMessage(requestError));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTask(deleteTarget._id);
      setTasks((current) => current.filter((task) => task._id !== deleteTarget._id));
      setNoticeError(false);
      setNotice("Task deleted.");
    } catch (requestError) {
      setNoticeError(true);
      setNotice(getErrorMessage(requestError));
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) return <LoadingState label="Loading tasks" />;
  if (error) return <ErrorState message={error} />;

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title="My tasks"
        description={isAdmin ? "Review and manage tasks across your workspace." : "Stay on top of the work assigned to you."}
        action={isAdmin ? <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>New task</Button> : undefined}
      />
      {notice && <Alert severity={noticeError ? "error" : "success"} onClose={() => setNotice("")}>{notice}</Alert>}
      <Card>
        <CardContent sx={{ p: "0 !important" }}>
          {filteredTasks.length ? (
            <Box sx={{ overflowX: "auto" }}>
              <Table sx={{ minWidth: 850 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#FAFBFD" }}>
                    <TableCell sx={{ color: "text.secondary", fontSize: 11, fontWeight: 700 }}>TASK</TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: 11, fontWeight: 700 }}>PROJECT</TableCell>
                    {isAdmin && <TableCell sx={{ color: "text.secondary", fontSize: 11, fontWeight: 700 }}>ASSIGNEE</TableCell>}
                    <TableCell sx={{ color: "text.secondary", fontSize: 11, fontWeight: 700 }}>PRIORITY</TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: 11, fontWeight: 700 }}>DUE DATE</TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: 11, fontWeight: 700 }}>STATUS</TableCell>
                    {isAdmin && <TableCell align="right" sx={{ color: "text.secondary", fontSize: 11, fontWeight: 700 }}>ACTIONS</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task._id} hover>
                      <TableCell sx={{ maxWidth: 270 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{task.title}</Typography>
                        {task.description && (
                          <Typography noWrap sx={{ mt: 0.35, color: "text.secondary", fontSize: 11.5 }}>{task.description}</Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12.5, color: "text.secondary" }}>{getName(task.project) || "—"}</TableCell>
                      {isAdmin && <TableCell sx={{ fontSize: 12.5 }}>{getName(task.assignedTo) || "—"}</TableCell>}
                      <TableCell><PriorityChip priority={task.priority} /></TableCell>
                      <TableCell sx={{ color: task.dueDate && isOverdue(task.dueDate) && task.status !== "COMPLETED" ? "error.main" : "text.secondary", fontSize: 12 }}>
                        {formatDate(task.dueDate)}
                      </TableCell>
                      <TableCell>
                        <TextField
                          select
                          size="small"
                          value={task.status}
                          onChange={(event) => changeStatus(task, event.target.value as TaskStatus)}
                          sx={{
                            minWidth: 130,
                            "& .MuiOutlinedInput-root": { height: 32, fontSize: 11.5, bgcolor: "#fff" },
                          }}
                        >
                          {statuses.map((status) => (
                            <MenuItem key={status} value={status}>{status === "TODO" ? "To do" : status === "IN_PROGRESS" ? "In progress" : "Completed"}</MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      {isAdmin && (
                        <TableCell align="right">
                          <Tooltip title="Edit task">
                            <IconButton size="small" onClick={() => openEdit(task)} aria-label="Edit task"><EditOutlinedIcon fontSize="small" /></IconButton>
                          </Tooltip>
                          <Tooltip title="Delete task">
                            <IconButton size="small" color="error" onClick={() => setDeleteTarget(task)} aria-label="Delete task"><DeleteOutlineIcon fontSize="small" /></IconButton>
                          </Tooltip>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          ) : (
            <EmptyState
              title={query ? "No tasks match your search" : "No tasks yet"}
              description={query ? "Try another search term." : isAdmin ? "Create a task and assign it to an active project member." : "Tasks assigned to you will appear here."}
              action={isAdmin && !query ? <Button variant="contained" onClick={openCreate}>Create task</Button> : undefined}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={open || createRequested} onClose={closeTaskDialog} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={save}>
          <DialogTitle>{editing ? "Edit task" : "Create a task"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 0.5 }}>
              <TextField label="Task title" required slotProps={{ htmlInput: { minLength: 3 } }} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
              <TextField label="Description" multiline minRows={2} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
              {!editing && (
                <>
                  <TextField select label="Project" required value={form.projectId} onChange={(event) => {
                    const projectId = event.target.value;
                    const nextProject = projects.find((project) => project._id === projectId);
                    const nextAssignee = users.find((member) =>
                      nextProject?.members.some((projectMember) => getId(projectMember) === getId(member)),
                    );
                    setForm({ ...form, projectId, assignedTo: nextAssignee ? getId(nextAssignee) : "" });
                  }}>
                    {projects.map((project) => <MenuItem key={project._id} value={project._id}>{project.name}</MenuItem>)}
                  </TextField>
                  <TextField
                    select
                    label="Assign to"
                    required
                    value={form.assignedTo}
                    onChange={(event) => setForm({ ...form, assignedTo: event.target.value })}
                    helperText={
                      assignableUsers.length
                        ? "Choose an active member of this project."
                        : selectedProject
                          ? "No active members are assigned to this project yet. Add members from Projects > Manage members, then reopen this form."
                          : "Create or select a project first."
                    }
                  >
                    {assignableUsers.map((member) => <MenuItem key={getId(member)} value={getId(member)}>{member.name} · {member.email}</MenuItem>)}
                  </TextField>
                </>
              )}
              {editing && (
                <TextField
                  select
                  label="Assign to"
                  value={form.assignedTo}
                  onChange={(event) => setForm({ ...form, assignedTo: event.target.value })}
                  helperText="Choose an active member of this project, or leave the task unassigned."
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {currentAssigneeId &&
                    !assignableUsers.some((member) => getId(member) === currentAssigneeId) && (
                      <MenuItem value={currentAssigneeId}>
                        {getName(editing.assignedTo) || "Current assignee"}
                      </MenuItem>
                    )}
                  {assignableUsers.map((member) => (
                    <MenuItem key={getId(member)} value={getId(member)}>
                      {member.name} · {member.email}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField select label="Priority" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as TaskPriority })} fullWidth>
                  {(["LOW", "MEDIUM", "HIGH"] as TaskPriority[]).map((priority) => <MenuItem key={priority} value={priority}>{priority}</MenuItem>)}
                </TextField>
                <DateField label="Due date" value={form.dueDate} onChange={(dueDate) => setForm({ ...form, dueDate })} fullWidth />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button type="button" onClick={closeTaskDialog} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving || (!editing && (!projects.length || !assignableUsers.length))}>
              {saving ? "Saving…" : editing ? "Save changes" : "Create task"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete this task?</DialogTitle>
        <DialogContent><Typography sx={{ color: "text.secondary", fontSize: 13 }}>“{deleteTarget?.title}” will be permanently removed.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteTarget(null)} color="inherit">Cancel</Button>
          <Button onClick={confirmDelete} variant="contained" color="error">Delete task</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
