"use client";

import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Typography,
  Checkbox,
  TablePagination,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

const tickets = [
  { id: "INC793", subject: "Dad", requester: "Authbhai Nagro", assigned: "None", state: "New", status: "Spams", priority: "High" },
  { id: "SR745", subject: "Request For: Treter", requester: "Maarij T.Wen", assigned: "None", state: "New", status: "Pending", priority: "High" },
  { id: "INC664", subject: "TEST", requester: "Authbhai Nagro", assigned: "None", state: "New", status: "Pending", priority: "High" },
  { id: "SR635", subject: "Request For: Test Subject", requester: "Frontend Agent", assigned: "None", state: "New", status: "Closed", priority: "High" },
  { id: "INC68", subject: "Test Subject", requester: "John Doe Oec.M", assigned: "None", state: "New", status: "Open", priority: "High" },
];

export default function TicketsTable() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  return (
    <Box sx={{ mt: 2, overflowX: "auto" }}>
      <TableContainer component={Paper} sx={{ borderRadius: "10px", minWidth: isMobile ? 700 : "auto" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f9fafb" }}>
              <TableCell padding="checkbox">
                <Checkbox />
              </TableCell>
              {["Ticket ID", "Subject", "Requester", "Assigned to", "State", "Status", "Priority"].map((col) => (
                <TableCell key={col} sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {tickets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((t) => (
              <TableRow hover key={t.id}>
                <TableCell padding="checkbox">
                  <Checkbox />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: "#00bfa5", fontSize: 12 }}>-</Avatar>
                    <Typography variant="body2" sx={{ color: "#007bff", fontWeight: 500 }}>
                      #{t.id}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell><Typography variant="body2">{t.subject}</Typography></TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: "#00bfa5", fontSize: 12 }}>
                      {t.requester.split(" ").map((n) => n[0]).join("").toUpperCase()}
                    </Avatar>
                    <Typography variant="body2">{t.requester}</Typography>
                  </Box>
                </TableCell>
                <TableCell><Typography variant="body2" sx={{ color: "gray" }}>{t.assigned}</Typography></TableCell>
                <TableCell><Typography variant="body2">{t.state}</Typography></TableCell>
                <TableCell><Typography variant="body2">{t.status}</Typography></TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: "#d32f2f", fontWeight: 500 }}>
                    {t.priority}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={tickets.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}
