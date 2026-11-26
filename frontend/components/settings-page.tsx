"use client";

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
import LogoutIcon from "@mui/icons-material/LogoutRounded";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers";
import { PageHeader } from "@/components/shared";

const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "T";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <Stack spacing={2.5}>
      <PageHeader title="Settings" description="Your account and workspace access." />
      <Card sx={{ maxWidth: 760 }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Typography sx={{ fontSize: 15, fontWeight: 650 }}>Account profile</Typography>
          <Typography sx={{ mt: 0.45, mb: 2.5, color: "text.secondary", fontSize: 12.5 }}>
            Account information returned by the workspace.
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ mb: 2.5, alignItems: "center" }}>
            <Avatar sx={{ width: 52, height: 52, bgcolor: "#E6EAFE", color: "#465FDB", fontWeight: 700 }}>
              {initials(user?.name)}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 650, fontSize: 14 }}>{user?.name}</Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 12.5 }}>{user?.email}</Typography>
            </Box>
          </Stack>
          <Divider />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ py: 2.5 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ color: "text.secondary", fontSize: 11.5 }}>WORKSPACE ROLE</Typography>
              <Typography sx={{ mt: 0.6, fontSize: 13, fontWeight: 600 }}>
                {user?.role === "ADMIN" ? "Administrator" : "Team member"}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.2} sx={{ flex: 1 }}>
              <SecurityOutlinedIcon sx={{ color: "primary.main", fontSize: 19 }} />
              <Box>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>Role-based access</Typography>
                <Typography sx={{ mt: 0.4, color: "text.secondary", fontSize: 11.5, lineHeight: 1.55 }}>
                  Permissions are enforced by the API as well as the workspace interface.
                </Typography>
              </Box>
            </Stack>
          </Stack>
          <Divider />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ pt: 2.5, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" } }}>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Sign out</Typography>
              <Typography sx={{ mt: 0.35, color: "text.secondary", fontSize: 11.5 }}>
                End this session on this device.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={() => {
                signOut();
                router.replace("/sign-in");
              }}
            >
              Sign out
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
