"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import {
  Box,
  Paper,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Avatar,
  Chip,
  InputAdornment,
  IconButton,
  Divider,
  Popover,
  Button,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";
import { RootState } from "@/app/store";
import uploadFile from "@/app/social-components/chat/FileUpload";

interface User {
  id: string;
  name: string;
  email: string;
  online?: boolean;
}

interface Message {
  from: string;
  to: string;
  message: string;
  timestamp: string;
  userName?: string;
}

const THEME_COLOR = "rgb(56, 202, 181)";

export default function ChatPage() {
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserIdRef = useRef<string>("");
  const currentUserNameRef = useRef<string>("Current User");
  const currentUserEmailRef = useRef<string>("current@example.com");



  // Identify current user
  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
    if (storedUser?.email) {
      currentUserIdRef.current = storedUser.id || storedUser.email;
      currentUserNameRef.current =
        storedUser.name || storedUser.email.split("@")[0];
      currentUserEmailRef.current = storedUser.email;
    } else if (authUser?.email) {
      currentUserIdRef.current = authUser.id || authUser.email;
      currentUserNameRef.current =
        authUser.name || authUser.email.split("@")[0];
      currentUserEmailRef.current = authUser.email;
    } else {
      currentUserIdRef.current = `user_${Date.now()}`;
      currentUserNameRef.current = "Guest User";
      currentUserEmailRef.current = "guest@example.com";
    }
  }, [authUser]);

  const messages = useMemo(() => {
    if (!selectedUser) return [];
    const userId = currentUserIdRef.current;
    return allMessages
      .filter(
        (msg) =>
          (msg.from === userId && msg.to === selectedUser.id) ||
          (msg.to === userId && msg.from === selectedUser.id)
      )
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
  }, [allMessages, selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Socket setup
  useEffect(() => {
    const newSocket = io("http://localhost:3001", {
      transports: ["websocket", "polling"],
    });
    setSocket(newSocket);

    newSocket.on("users:updated", (usersList: User[]) => setUsers(usersList));

    newSocket.on("message:receive", (message: Message) => {
      setAllMessages((prev) => [...prev, message]);
    });
    newSocket.on("message:sent", (message: Message) => {
      setAllMessages((prev) => [...prev, message]);
    });

    const handleConnect = () => {
      newSocket.emit("user:join", {
        userId: currentUserIdRef.current,
        userName: currentUserNameRef.current,
        email: currentUserEmailRef.current,
      });
    };


    newSocket.on("connect", handleConnect);

    if (newSocket.connected) handleConnect();

    fetch("http://localhost:3001/api/users")
      .then((res) => res.json())
      .then((usersList: User[]) => setUsers(usersList))
      .catch((err) => console.error("Error fetching users:", err));

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!selectedUser || !socket) return;

    const userId = currentUserIdRef.current;
    setAllMessages([]);

    const handleHistory = (history: Message[]) => {
      setAllMessages(history);
    };

    socket.on("messages:history", handleHistory);

    socket.emit("messages:get", {
      userId1: userId,
      userId2: selectedUser.id,
    });

    fetch(`http://localhost:3001/api/messages/${userId}/${selectedUser.id}`)
      .then((res) => res.json())
      .then((history: Message[]) => {
        setAllMessages((prev) => (prev.length > 0 ? prev : history));
      })
      .catch((err) => console.error("Error fetching messages:", err));

    return () => {
      socket.off("messages:history", handleHistory);
    };
  }, [selectedUser?.id, socket]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedUser || !socket) return;
    socket.emit("message:send", {
      from: currentUserIdRef.current,
      to: selectedUser.id,
      message: messageInput.trim(),
    });
    setMessageInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.id !== currentUserIdRef.current &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Attachment popup handlers
  const handleAttachClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClosePopover = () => setAnchorEl(null);
  const openPopover = Boolean(anchorEl);

  
  // Upload handlers (image/document)
  const handleUpload = async (type: "image" | "document") => {
    handleClosePopover();
    if (!selectedUser || !socket) return;
    try {
      const msg = await uploadFile(type);
      if (!msg) return; 
      socket.emit("message:send", {
        from: currentUserIdRef.current,
        to: selectedUser.id,
        message: msg,
      });
    } catch (e) {
      console.error("File upload failed:", e);
    }
  };



  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Chat
      </Typography>

      <Box sx={{ display: "flex", gap: 2, flex: 1, minHeight: 0 }}>
        {/* User List */}
        <Paper sx={{ width: 300, display: "flex", flexDirection: "column", p: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="h6">Users</Typography>
            <IconButton
              size="small"
              sx={{
                bgcolor: THEME_COLOR,
                color: "white",
                "&:hover": { bgcolor: THEME_COLOR },
              }}
            >
              <PersonAddIcon />
            </IconButton>
          </Box>

          <TextField
            size="small"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1 }}
          />

          <Divider sx={{ mb: 1 }} />
          <List sx={{ flex: 1, overflow: "auto" }}>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <ListItem key={user.id} disablePadding>
                  <ListItemButton
                    selected={selectedUser?.id === user.id}
                    onClick={() => setSelectedUser(user)}
                  >
                    <Avatar sx={{ mr: 2, bgcolor: THEME_COLOR }}>
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <ListItemText primary={user.name} secondary={user.email} />
                    {user.online && (
                      <Chip
                        label="Online"
                        size="small"
                        sx={{
                          ml: 1,
                          mb: 2,
                          bgcolor: THEME_COLOR,
                          color: "white",
                          fontWeight: 500,
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <Box
                sx={{
                  textAlign: "center",
                  py: 4,
                  color: "text.secondary",
                  fontStyle: "italic",
                }}
              >
                No user found
              </Box>
            )}
          </List>

        </Paper>

        {/* Chat Area */}
        <Paper sx={{ flex: 1, display: "flex", flexDirection: "column", p: 0 }}>
          {selectedUser ? (
            <>
              {/* Header */}
              <Box
                sx={{
                  backgroundColor: THEME_COLOR,
                  color: "white",
                  px: 2,
                  py: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Avatar sx={{ bgcolor: "white", color: THEME_COLOR }}>
                  {selectedUser.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedUser.name}</Typography>
                  <Typography variant="body2">{selectedUser.email}</Typography>
                </Box>
              </Box>

              {/* Messages */}
              <Box sx={{ flex: 1, overflow: "auto", mb: 2, p: 2, bgcolor: "grey.50" }}>
                {messages.map((msg, index) => {
                  const isOwnMessage = msg.from === currentUserIdRef.current;
                  return (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                        mb: 1,
                      }}
                    >
                      <Paper
                        sx={{
                          p: 1.5,
                          maxWidth: "70%",
                          bgcolor: isOwnMessage ? THEME_COLOR : "white",
                          color: isOwnMessage ? "white" : "text.primary",
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5 }}>
                          {isOwnMessage ? "You" : msg.userName || selectedUser.name}
                        </Typography>
                        <Typography variant="body1">{msg.message}</Typography>
                        <Typography
                          variant="caption"
                          sx={{ display: "block", mt: 0.5, opacity: 0.7 }}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </Typography>
                      </Paper>
                    </Box>
                  );
                })}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input & Attach */}
              <Box sx={{ display: "flex", gap: 1, p: 2, pt: 0 }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton
                          onClick={handleAttachClick}
                          sx={{
                            color: THEME_COLOR,
                            "&:hover": { bgcolor: "transparent" },
                          }}
                        >
                          <AttachFileIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleSendMessage}
                          disabled={!messageInput.trim()}
                          sx={{
                            bgcolor: "white",
                            color: THEME_COLOR,
                            border: `2px solid ${THEME_COLOR}`,
                            "&:hover": { bgcolor: "white" },
                          }}
                        >
                          <SendIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Popover for Attach */}
                <Popover
                  open={openPopover}
                  anchorEl={anchorEl}
                  onClose={handleClosePopover}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                  transformOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  PaperProps={{
                    sx: {
                      p: 2,
                      borderRadius: 2,
                      boxShadow: 3,
                    },
                  }}
                >
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    Select Attachment Type
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="contained"
                      sx={{
                        bgcolor: THEME_COLOR,
                        "&:hover": { bgcolor: THEME_COLOR },
                        textTransform: "none",
                      }}
                      onClick={() => handleUpload("image")}
                    >
                      Image
                    </Button>
                    <Button
                      variant="contained"
                      sx={{
                        bgcolor: THEME_COLOR,
                        "&:hover": { bgcolor: THEME_COLOR },
                        textTransform: "none",
                      }}
                      onClick={() => handleUpload("document")}
                    >
                      Document
                    </Button>
                  </Box> 
                 

                </Popover>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Select a user to start chatting
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
