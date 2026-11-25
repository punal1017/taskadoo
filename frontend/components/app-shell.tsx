"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/AddRounded";
import CalendarIcon from "@mui/icons-material/CalendarMonthOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import FolderIcon from "@mui/icons-material/FolderOutlined";
import GroupIcon from "@mui/icons-material/GroupsOutlined";
import MenuIcon from "@mui/icons-material/MenuRounded";
import NotificationsIcon from "@mui/icons-material/NotificationsNoneRounded";
import SearchIcon from "@mui/icons-material/SearchRounded";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import ViewKanbanIcon from "@mui/icons-material/ViewKanbanOutlined";
import { useAuth } from "@/components/providers";
import type { ReactNode } from "react";

const drawerWidth = 250;

const navigation = [
  { label: "Overview", path: "/dashboard", icon: <DashboardIcon /> },
  { label: "Projects", path: "/projects", icon: <FolderIcon /> },
  { label: "My tasks", path: "/tasks", icon: <CheckCircleIcon /> },
  { label: "Kanban board", path: "/kanban", icon: <ViewKanbanIcon /> },
  { label: "Calendar", path: "/calendar", icon: <CalendarIcon /> },
  { label: "Team", path: "/team", icon: <GroupIcon />, adminOnly: true },
  { label: "Settings", path: "/settings", icon: <SettingsIcon /> },
];

const titleForPath = (path: string) =>
  navigation.find((item) => path === item.path || path.startsWith(`${item.path}/`))
    ?.label ?? "Workspace";

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "T";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("md"));
  const { user, ready, signOut } = useAuth();
  const isPublic = pathname === "/sign-in" || pathname === "/register";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.value =
        new URLSearchParams(window.location.search).get("q") ?? "";
    }
  }, [pathname]);

  useEffect(() => {
    if (!ready || isPublic) return;
    if (!user) router.replace("/sign-in");
    else if (pathname.startsWith("/team") && user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [isPublic, pathname, ready, router, user]);

  const visibleNavigation = useMemo(
    () => navigation.filter((item) => !item.adminOnly || user?.role === "ADMIN"),
    [user?.role],
  );

  if (isPublic) return <>{children}</>;
  if (!ready || !user) {
    return (
      <Box
        sx={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          color: "text.secondary",
          fontSize: 14,
        }}
      >
        Opening your workspace…
      </Box>
    );
  }

  const sidebar = (
    <Box
      sx={{
        width: drawerWidth,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        px: 2,
        py: 2.25,
        color: "#E9ECF3",
        bgcolor: "#202532",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, px: 1, mb: 4 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            display: "grid",
            placeItems: "center",
            borderRadius: "11px",
            color: "#fff",
            bgcolor: "#4F6BED",
          }}
        >
          <CheckCircleIcon fontSize="small" />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 16, letterSpacing: "-.02em" }}>
            Taskadoo
          </Typography>
          <Typography sx={{ color: "#9DA6B8", fontSize: 11 }}>
            PROJECT WORKSPACE
          </Typography>
        </Box>
      </Box>

      <Typography
        sx={{
          px: 1.25,
          mb: 1,
          color: "#8992A3",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: ".1em",
        }}
      >
        WORKSPACE
      </Typography>
      <List disablePadding sx={{ display: "grid", gap: 0.5 }}>
        {visibleNavigation.map((item) => {
          const active =
            pathname === item.path || pathname.startsWith(`${item.path}/`);
          return (
            <ListItemButton
              key={item.path}
              onClick={() => {
                router.push(item.path);
                setMobileOpen(false);
              }}
              sx={{
                minHeight: 42,
                px: 1.25,
                borderRadius: 2.5,
                color: active ? "#FFFFFF" : "#B9C0CE",
                bgcolor: active ? "#30394B" : "transparent",
                "&:hover": { bgcolor: active ? "#30394B" : "#293141" },
                "&::before": active
                  ? {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 9,
                      bottom: 9,
                      width: 3,
                      borderRadius: 3,
                      bgcolor: "#7187FF",
                    }
                  : {},
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 34,
                  color: active ? "#9CACFF" : "#97A0B1",
                  "& .MuiSvgIcon-root": { fontSize: 20 },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: { sx: { fontSize: 13, fontWeight: active ? 600 : 500 } },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ mt: "auto" }}>
        {user.role === "ADMIN" && (
          <Button
            fullWidth
            startIcon={<AddIcon />}
            onClick={() => router.push("/projects?create=1")}
            sx={{
              justifyContent: "flex-start",
              mb: 2,
              px: 1.25,
              color: "#C9D0DE",
              bgcolor: "#293141",
              "&:hover": { bgcolor: "#30394B" },
            }}
          >
            Create a project
          </Button>
        )}
        <Divider sx={{ borderColor: "rgba(255,255,255,.09)", mb: 1.5 }} />
        <ListItemButton
          onClick={(event) => setMenuAnchor(event.currentTarget)}
          sx={{ px: 1, borderRadius: 2.5, "&:hover": { bgcolor: "#293141" } }}
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              mr: 1.2,
              fontSize: 12,
              fontWeight: 700,
              bgcolor: "#49566D",
            }}
          >
            {initials(user.name)}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography noWrap sx={{ fontSize: 12.5, fontWeight: 600 }}>
              {user.name}
            </Typography>
            <Typography sx={{ color: "#9DA6B8", fontSize: 11 }}>
              {user.role === "ADMIN" ? "Administrator" : "Team member"}
            </Typography>
          </Box>
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "background.default" }}>
      <Drawer
        variant={desktop ? "permanent" : "temporary"}
        open={desktop || mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: desktop ? drawerWidth : undefined,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            border: 0,
            borderRadius: desktop ? "0 18px 18px 0" : 0,
            overflow: "hidden",
          },
        }}
      >
        {sidebar}
      </Drawer>

      <Box
        sx={{
          minHeight: "100dvh",
          ml: { md: `${drawerWidth}px` },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          component="header"
          sx={{
            height: 74,
            px: { xs: 2, sm: 3.5, lg: 5 },
            display: "flex",
            alignItems: "center",
            gap: 2,
            bgcolor: "rgba(255,255,255,.88)",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          {!desktop && (
            <IconButton
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              size="small"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography sx={{ minWidth: { sm: 140 }, fontWeight: 650, fontSize: 15 }}>
            {titleForPath(pathname)}
          </Typography>
          <TextField
            size="small"
            placeholder="Search projects and tasks"
            inputRef={searchRef}
            onChange={(event) => {
              const nextQuery = event.target.value;
              const params = new URLSearchParams(window.location.search);
              if (nextQuery) params.set("q", nextQuery);
              else params.delete("q");
              const suffix = params.toString();
              window.history.replaceState(
                null,
                "",
                `${pathname}${suffix ? `?${suffix}` : ""}`,
              );
              window.dispatchEvent(new Event("taskadoo-search"));
            }}
            sx={{
              width: { xs: "100%", sm: 280, lg: 340 },
              ml: { sm: "auto" },
              "& .MuiOutlinedInput-root": { bgcolor: "#F8F9FC", height: 38 },
              "& input": { fontSize: 12.5 },
            }}
            slotProps={{
              input: {
                startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#8C94A3", fontSize: 19 }} />
                </InputAdornment>
                ),
              },
            }}
          />
          <Tooltip title="Notifications are not available yet">
            <IconButton
              aria-label="Notifications"
              onClick={() =>
                setNotice("Notifications will appear here when available.")
              }
              sx={{ color: "text.secondary" }}
            >
              <Badge variant="dot" color="primary" invisible>
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <IconButton
            onClick={(event) => setMenuAnchor(event.currentTarget)}
            sx={{ p: 0.3 }}
            aria-label="Open account menu"
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: "#E6EAFE",
                color: "#465FDB",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {initials(user.name)}
            </Avatar>
          </IconButton>
        </Box>

        <Box
          component="main"
          className="page-enter"
          sx={{
            width: "100%",
            maxWidth: 1600,
            mx: "auto",
            p: { xs: 2, sm: 3.5, lg: 5 },
            flex: 1,
          }}
        >
          {children}
        </Box>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            router.push("/settings");
          }}
        >
          Account settings
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            signOut();
            router.replace("/sign-in");
          }}
        >
          Sign out
        </MenuItem>
      </Menu>
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={3500}
        onClose={() => setNotice("")}
        message={notice}
      />
    </Box>
  );
}
