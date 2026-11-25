"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircleRounded";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOffOutlined";
import { register as registerRequest, signIn as signInRequest } from "@/services/auth.service";
import { getErrorMessage } from "@/lib/errors";
import { useAuth } from "@/components/providers";

export default function AuthPage({ mode }: { mode: "sign-in" | "register" }) {
  const isRegister = mode === "register";
  const router = useRouter();
  const { signIn } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = isRegister
        ? await registerRequest(name.trim(), email.trim(), password)
        : await signInRequest(email.trim(), password);
      signIn(result, remember);
      router.replace("/dashboard");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "minmax(400px, 1fr) minmax(420px, .9fr)" },
        bgcolor: "#fff",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: "100dvh",
          px: { xs: 3, sm: 7, lg: 12 },
          py: { xs: 3, sm: 5 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box sx={{ display: "grid", placeItems: "center", width: 35, height: 35, borderRadius: 2.5, color: "#fff", bgcolor: "primary.main" }}>
            <CheckCircleIcon fontSize="small" />
          </Box>
          <Typography sx={{ fontWeight: 750, fontSize: 17, letterSpacing: "-.03em" }}>
            Taskadoo
          </Typography>
        </Box>

        <Box sx={{ width: "100%", maxWidth: 420, mx: "auto", py: 6 }}>
          <Typography variant="h2" sx={{ fontSize: 28 }}>
            {isRegister ? "Create your account" : "Welcome back"}
          </Typography>
          <Typography sx={{ mt: 1, mb: 3.5, color: "text.secondary", fontSize: 13.5 }}>
            {isRegister
              ? "Start organizing your projects and work with your team."
              : "Sign in to pick up where you and your team left off."}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

          <Box component="form" onSubmit={submit}>
            <Stack spacing={2.2}>
              {isRegister && (
                <TextField
                  label="Full name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  required
                  slotProps={{ htmlInput: { minLength: 3 } }}
                />
              )}
              <TextField
                label="Email address"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isRegister ? "new-password" : "current-password"}
                required
                slotProps={{
                  htmlInput: { minLength: isRegister ? 6 : 1 },
                  input: {
                    endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((value) => !value)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                    ),
                  },
                }}
              />
              {!isRegister && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                      size="small"
                    />
                  }
                  label={<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>Keep me signed in on this device</Typography>}
                  sx={{ mt: -0.5 }}
                />
              )}
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
              </Button>
            </Stack>
          </Box>

          <Typography sx={{ mt: 3, textAlign: "center", color: "text.secondary", fontSize: 13 }}>
            {isRegister ? "Already have an account?" : "New to Taskadoo?"}{" "}
            <Box
              component={Link}
              href={isRegister ? "/sign-in" : "/register"}
              sx={{ color: "primary.main", fontWeight: 650 }}
            >
              {isRegister ? "Sign in" : "Create an account"}
            </Box>
          </Typography>
        </Box>

        <Typography sx={{ color: "#9AA1AE", fontSize: 11.5 }}>
          © {new Date().getFullYear()} Taskadoo. Built for focused teams.
        </Typography>
      </Box>

      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          justifyContent: "center",
          px: 7,
          bgcolor: "#F6F7FB",
          borderLeft: "1px solid #E8EAF0",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 460,
            p: 4,
            bgcolor: "#fff",
            border: "1px solid #E8EAF0",
            borderRadius: 4,
          }}
        >
          <Typography sx={{ color: "primary.main", fontWeight: 700, fontSize: 11, letterSpacing: ".12em" }}>
            YOUR WORK, IN FOCUS
          </Typography>
          <Typography sx={{ mt: 1.6, fontSize: 25, lineHeight: 1.25, letterSpacing: "-.035em", fontWeight: 700 }}>
            A calmer way to move projects forward.
          </Typography>
          <Typography sx={{ mt: 1.2, color: "text.secondary", fontSize: 13.5, lineHeight: 1.7 }}>
            Bring projects, tasks, and your team into one clear workspace. Spend less time coordinating and more time making progress.
          </Typography>
          <Stack spacing={1.6} sx={{ mt: 3.5 }}>
            {["See the work that matters today", "Keep project ownership visible", "Move tasks forward together"].map((item) => (
              <Stack direction="row" spacing={1.2} sx={{ alignItems: "center" }} key={item}>
                <CheckCircleIcon sx={{ color: "#269B73", fontSize: 18 }} />
                <Typography sx={{ fontSize: 13, color: "#51596A" }}>{item}</Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
