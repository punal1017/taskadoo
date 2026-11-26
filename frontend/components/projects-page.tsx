"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Avatar,
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
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNewRounded";
import { useAuth } from "@/components/providers";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  MemberAvatars,
  PageHeader,
  ProjectProgress,
  StatusChip,
} from "@/components/shared";
import {
  addProjectMember,
  createProject,
  deleteProject,
  getProjects,
  removeProjectMember,
  updateProject,
} from "@/services/project.service";
import { getUsers } from "@/services/user.service";
import { getTasks } from "@/services/task.service";
import { getErrorMessage } from "@/lib/errors";
import type { Project, Task, User } from "@/types/models";
import { getId } from "@/types/models";
import useGlobalQuery from "@/lib/use-global-query";
import DateField from "@/components/date-field";

type ProjectForm = {
  name: string;
  description: string;
  startDate: string;
  dueDate: string;
};

const emptyForm: ProjectForm = {
  name: "",
  description: "",
  startDate: "",
  dueDate: "",
};

const toDateInput = (value?: string) => value?.slice(0, 10) ?? "";

export default function ProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdmin = user?.role === "ADMIN";
  const createRequested = isAdmin && searchParams.get("create") === "1";
  const query = useGlobalQuery().toLowerCase();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeError, setNoticeError] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [memberProject, setMemberProject] = useState<Project | null>(null);
  const [memberId, setMemberId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const refresh = async () => {
    const [nextProjects, nextTasks] = await Promise.all([getProjects(), getTasks()]);
    setProjects(nextProjects);
    setTasks(nextTasks);
    return nextProjects;
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      getProjects(),
      getTasks(),
      isAdmin ? getUsers() : Promise.resolve([] as User[]),
    ])
      .then(([nextProjects, nextTasks, nextUsers]) => {
        if (!active) return;
        setProjects(nextProjects);
        setTasks(nextTasks);
        setUsers(nextUsers);
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
  }, [isAdmin]);

  const visibleProjects = useMemo(
    () =>
      projects.filter((project) =>
        `${project.name} ${project.description ?? ""}`.toLowerCase().includes(query),
      ),
    [projects, query],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const closeProjectDialog = () => {
    setDialogOpen(false);
    if (createRequested) router.replace("/projects");
  };

  const openEdit = (project: Project) => {
    setEditing(project);
    setForm({
      name: project.name,
      description: project.description ?? "",
      startDate: toDateInput(project.startDate),
      dueDate: toDateInput(project.dueDate),
    });
    setDialogOpen(true);
  };

  const saveProject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        startDate: form.startDate || undefined,
        dueDate: form.dueDate || undefined,
      };
      if (editing) await updateProject(editing._id, payload);
      else await createProject(payload);
      await refresh();
      closeProjectDialog();
      setNoticeError(false);
      setNotice(editing ? "Project updated." : "Project created.");
    } catch (requestError) {
      setNoticeError(true);
      setNotice(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProject(deleteTarget._id);
      setProjects((current) => current.filter((project) => project._id !== deleteTarget._id));
      setNoticeError(false);
      setNotice("Project deleted.");
    } catch (requestError) {
      setNoticeError(true);
      setNotice(getErrorMessage(requestError));
    } finally {
      setDeleteTarget(null);
    }
  };

  const saveMember = async () => {
    if (!memberProject || !memberId) return;
    try {
      await addProjectMember(memberProject._id, memberId);
      await refresh();
      setMemberProject(null);
      setMemberId("");
      setNoticeError(false);
      setNotice("Project member added.");
    } catch (requestError) {
      setNoticeError(true);
      setNotice(getErrorMessage(requestError));
    }
  };

  const removeMember = async (project: Project, member: User | string) => {
    const id = getId(member);
    if (!id) return;
    try {
      await removeProjectMember(project._id, id);
      const nextProjects = await refresh();
      setMemberProject((current) =>
        current ? nextProjects.find((item) => item._id === current._id) ?? current : null,
      );
      setNoticeError(false);
      setNotice("Project member removed.");
    } catch (requestError) {
      setNoticeError(true);
      setNotice(getErrorMessage(requestError));
    }
  };

  if (loading) return <LoadingState label="Loading projects" />;
  if (error) return <ErrorState message={error} />;

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title="Projects"
        description="Organize initiatives, people, and progress in one place."
        action={
          isAdmin ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              New project
            </Button>
          ) : undefined
        }
      />

      {notice && (
        <Alert severity={noticeError ? "error" : "success"} onClose={() => setNotice("")}>
          {notice}
        </Alert>
      )}

      {visibleProjects.length ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
          {visibleProjects.map((project) => (
            <Card key={project._id} sx={{ display: "flex", flexDirection: "column", minHeight: 245, transition: "transform 180ms ease, box-shadow 180ms ease", "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(32,37,50,.07)" } }}>
              <CardContent sx={{ p: "20px !important", display: "flex", flexDirection: "column", flex: 1 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                      <Typography component={Link} href={`/projects/${project._id}`} sx={{ fontWeight: 650, fontSize: 15, "&:hover": { color: "primary.main" } }}>
                        {project.name}
                      </Typography>
                      <StatusChip status={project.status} />
                    </Stack>
                    <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 12.5, lineHeight: 1.6, minHeight: 40 }}>
                      {project.description || "A shared project space for your team’s work."}
                    </Typography>
                  </Box>
                  {isAdmin && (
                    <Stack direction="row" spacing={0.25}>
                      <Tooltip title="Manage members">
                        <IconButton size="small" aria-label="Manage project members" onClick={() => setMemberProject(project)}>
                          <GroupAddOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit project">
                        <IconButton size="small" aria-label="Edit project" onClick={() => openEdit(project)}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete project">
                        <IconButton size="small" aria-label="Delete project" onClick={() => setDeleteTarget(project)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  )}
                  {!isAdmin && (
                    <IconButton component={Link} href={`/projects/${project._id}`} size="small" aria-label="Open project">
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  )}
                </Stack>

                <Box sx={{ mt: "auto", pt: 2.5 }}>
                  <ProjectProgress project={project} tasks={tasks} />
                  <Stack direction="row" sx={{ mt: 2, justifyContent: "space-between", alignItems: "center" }}>
                    <MemberAvatars members={project.members ?? []} />
                    <Typography sx={{ color: "text.secondary", fontSize: 11.5 }}>
                      {project.dueDate ? `Due ${new Date(project.dueDate).toLocaleDateString("en", { month: "short", day: "numeric" })}` : "No due date"}
                    </Typography>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Card>
          <EmptyState
            title={query ? "No projects match your search" : "Your projects start here"}
            description={query ? "Try another search term." : "Create a project to give your team a shared place for work and tasks."}
            action={isAdmin && !query ? <Button variant="contained" onClick={openCreate}>Create project</Button> : undefined}
          />
        </Card>
      )}

      <Dialog open={dialogOpen || createRequested} onClose={closeProjectDialog} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={saveProject}>
          <DialogTitle sx={{ pb: 0.5 }}>{editing ? "Edit project" : "Create a project"}</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2.5, color: "text.secondary", fontSize: 13 }}>
              {editing ? "Update the project details." : "Start with a name and a few details. You can manage members after creation."}
            </Typography>
            <Stack spacing={2}>
              <TextField label="Project name" required slotProps={{ htmlInput: { minLength: 3 } }} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              <TextField label="Description" multiline minRows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <DateField label="Start date" value={form.startDate} onChange={(startDate) => setForm({ ...form, startDate })} fullWidth />
                <DateField label="Due date" value={form.dueDate} onChange={(dueDate) => setForm({ ...form, dueDate })} minDate={form.startDate} fullWidth />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button type="button" onClick={closeProjectDialog} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Create project"}</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={Boolean(memberProject)} onClose={() => setMemberProject(null)} fullWidth maxWidth="xs">
        <DialogTitle>Project members</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2, color: "text.secondary", fontSize: 13 }}>
            Add active team members or remove existing members.
          </Typography>
          <Stack spacing={1.2} sx={{ mb: 2 }}>
            {(memberProject?.members ?? []).map((member, index) => {
              const label = typeof member === "string" ? "Project member" : member.name;
              const memberIdValue = getId(member);
              const isOwner = getId(memberProject?.owner ?? "") === memberIdValue;
              return (
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }} key={memberIdValue || index}>
                  <Avatar sx={{ width: 30, height: 30, fontSize: 11 }}>{label?.[0]?.toUpperCase() ?? "M"}</Avatar>
                  <Typography sx={{ flex: 1, fontSize: 13 }}>{label}{isOwner ? " · Owner" : ""}</Typography>
                  {!isOwner && (
                    <Button size="small" color="error" onClick={() => memberProject && removeMember(memberProject, member)}>
                      Remove
                    </Button>
                  )}
                </Stack>
              );
            })}
          </Stack>
          <Stack direction="row" spacing={1}>
            <Select
              fullWidth
              size="small"
              displayEmpty
              value={memberId}
              onChange={(event) => setMemberId(event.target.value)}
              renderValue={(value) => value ? users.find((item) => getId(item) === value)?.name ?? "Select member" : "Select member"}
            >
              {users
                .filter((member) => member.isActive && !(memberProject?.members ?? []).some((current) => getId(current) === getId(member)))
                .map((member) => <MenuItem key={getId(member)} value={getId(member)}>{member.name} · {member.email}</MenuItem>)}
            </Select>
            <Button variant="contained" disabled={!memberId} onClick={saveMember}>Add</Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setMemberProject(null)}>Done</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete this project?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
            “{deleteTarget?.name}” will be removed. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteTarget(null)} color="inherit">Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Delete project</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
