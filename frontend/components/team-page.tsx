"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useAuth } from "@/components/providers";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/shared";
import { getUsers, updateUserStatus } from "@/services/user.service";
import { getErrorMessage } from "@/lib/errors";
import type { User } from "@/types/models";
import { getId } from "@/types/models";
import useGlobalQuery from "@/lib/use-global-query";

export default function TeamPage() {
  const { user } = useAuth();
  const query = useGlobalQuery().toLowerCase();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    let active = true;
    getUsers()
      .then((items) => active && setUsers(items))
      .catch((requestError: unknown) => active && setError(getErrorMessage(requestError)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user?.role]);

  const filtered = useMemo(
    () => users.filter((item) => `${item.name} ${item.email} ${item.role}`.toLowerCase().includes(query)),
    [query, users],
  );

  if (user?.role !== "ADMIN") {
    return <ErrorState message="Team management is available to administrators only." />;
  }

  const toggleStatus = async (target: User) => {
    const id = getId(target);
    const isActive = !target.isActive;
    setUsers((items) => items.map((item) => getId(item) === id ? { ...item, isActive } : item));
    setNotice("");
    try {
      const updated = await updateUserStatus(id, isActive);
      setUsers((items) => items.map((item) => getId(item) === id ? updated : item));
    } catch (requestError) {
      setUsers((items) => items.map((item) => getId(item) === id ? target : item));
      setNotice(getErrorMessage(requestError));
    }
  };

  if (loading) return <LoadingState label="Loading team" />;
  if (error) return <ErrorState message={error} />;

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title="Team"
        description="Manage workspace access for registered team members."
      />
      {notice && <Alert severity="error" onClose={() => setNotice("")}>{notice}</Alert>}
      <Card>
        <CardContent sx={{ p: "0 !important" }}>
          {filtered.length ? (
            <Box sx={{ overflowX: "auto" }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#FAFBFD" }}>
                    <TableCell sx={{ color: "text.secondary", fontSize: 11, fontWeight: 700 }}>TEAM MEMBER</TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: 11, fontWeight: 700 }}>ROLE</TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: 11, fontWeight: 700 }}>STATUS</TableCell>
                    <TableCell align="right" sx={{ color: "text.secondary", fontSize: 11, fontWeight: 700 }}>ACCESS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((member) => {
                    const isSelf = getId(member) === getId(user ?? "");
                    return (
                      <TableRow key={getId(member)} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1.3} sx={{ alignItems: "center" }}>
                            <Avatar sx={{ width: 34, height: 34, fontSize: 12, fontWeight: 650, bgcolor: "#E6EAFE", color: "#465FDB" }}>
                              {member.name.slice(0, 1).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{member.name}{isSelf ? " (you)" : ""}</Typography>
                              <Typography sx={{ color: "text.secondary", fontSize: 11.5 }}>{member.email}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ fontSize: 12.5 }}>{member.role === "ADMIN" ? "Administrator" : "Member"}</TableCell>
                        <TableCell>
                          <Typography sx={{ color: member.isActive ? "success.main" : "text.secondary", fontSize: 12, fontWeight: 600 }}>
                            {member.isActive ? "Active" : "Inactive"}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Switch
                            size="small"
                            checked={Boolean(member.isActive)}
                            disabled={isSelf}
                            onChange={() => toggleStatus(member)}
                            slotProps={{ input: { "aria-label": `Toggle access for ${member.name}` } }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          ) : (
            <EmptyState title="No team members found" description={query ? "Try another search." : "Registered members will appear here."} />
          )}
        </CardContent>
      </Card>
      <Typography sx={{ color: "text.secondary", fontSize: 11.5 }}>
        New members can register from the sign-in page. Access changes take effect on their next API request.
      </Typography>
    </Stack>
  );
}
