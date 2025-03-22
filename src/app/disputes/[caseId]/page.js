"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
} from "@mui/material";
import { useRouter, useParams } from "next/navigation";

export default function DisputeConversation() {
  const { caseId } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(""); // ✅ Track user role

  useEffect(() => {
    const fetchDispute = async () => {
      try {
        const response = await fetch(`/api/disputes/${caseId}`);
        if (!response.ok) throw new Error("Failed to fetch dispute.");

        const data = await response.json();
        setDispute(data);
        setMessages(data.messages);
      } catch (error) {
        console.error("Error fetching dispute:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserRole = async () => {
      try {
        const response = await fetch("/api/users/role");
        if (!response.ok) throw new Error("Failed to fetch session");

        const session = await response.json();
        setUserRole(session.role);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchDispute();
    fetchUserRole();
  }, [caseId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await fetch(`/api/disputes/${caseId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage }),
      });

      setMessages([...messages, { message: newMessage, senderRole: "Admin" }]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const markAsResolved = async () => {
    try {
      const response = await fetch(`/api/disputes/${caseId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to mark as resolved");

      setDispute((prev) => ({ ...prev, status: "Resolved" }));
      router.push("/disputes");
    } catch (error) {
      console.error("Error resolving dispute:", error);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Dispute Case {caseId}
      </Typography>

      <Typography variant="subtitle1" sx={{ mb: 2, color: dispute?.status === "Resolved" ? "green" : "red" }}>
        Status: {dispute?.status}
      </Typography>

      <Paper sx={{ p: 2, mb: 2, maxHeight: 400, overflowY: "auto" }}>
        {messages.map((msg, index) => (
          <Typography key={index} sx={{ mb: 1, textAlign: msg.senderRole === "Admin" ? "right" : "left" }}>
            <strong>{msg.senderRole}:</strong> {msg.message}
          </Typography>
        ))}
      </Paper>

      {/* Hide text input and send button if dispute is resolved */}
      {dispute?.status !== "Resolved" ? (
        <>
          <TextField
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button variant="contained" sx={{ mt: 2 }} onClick={sendMessage}>
            Send Message
          </Button>

          {/* ✅ Show "Mark as Resolved" only if user is an Admin */}
          {userRole === "Admin" && (
            <Button variant="contained" color="success" sx={{ mt: 2, ml: 2 }} onClick={markAsResolved}>
              Mark as Resolved
            </Button>
          )}
        </>
      ) : (
        <Typography sx={{ mt: 2, fontStyle: "italic", color: "gray" }}>
          This dispute has been resolved. No further messages can be sent.
        </Typography>
      )}
    </Box>
  );
}
