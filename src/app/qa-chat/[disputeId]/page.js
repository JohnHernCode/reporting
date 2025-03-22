"use client";

import React, { useState, useEffect } from "react";
import {Box, Typography, TextField, Button, Paper, CircularProgress} from "@mui/material";
import { useParams } from "next/navigation";
import { io } from "socket.io-client";

let socket; // ✅ Global socket variable

export default function QAManagementChat() {
  const params = useParams();
  const disputeId = params.disputeId;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");

  const [disputeDetails, setDisputeDetails] = useState(null);
  const [chatData, setChatData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Chat Data
        const chatResponse = await fetch(`/api/qa-management-chat/${disputeId}`);
        if (!chatResponse.ok) throw new Error("Failed to fetch chat data.");
        const chatData = await chatResponse.json();
        setChatData(chatData);
        setMessages(chatData.chat?.messages || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [disputeId]);

  useEffect(() => {
    if (chatData && chatData.chat?.messages) {
      setMessages(chatData.chat.messages);
    }
  }, [chatData]);

  useEffect(() => {
    if (!socket) {
      socket = io({ path: "/api/socket", cors: { origin: "*" } });

      socket.on("connect", () => {
        console.log("✅ Connected to WebSocket");
        socket.emit("joinChat", disputeId);
      });

      socket.on("newMessage", (message) => {
        setMessages((prev) => [...prev, message]);
      });
    }

    return () => {
      if (socket) {
        socket.off("newMessage");
        socket.disconnect();
        console.log("❌ Disconnected from WebSocket");
      }
    };
  }, [disputeId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`/api/qa-management-chat/${disputeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();

      // ✅ Ensure `prev` is always an array
      setMessages((prev = []) => [...prev, data.newMessage]);

      // ✅ Emit the message via WebSocket (if needed)
      if (socket) {
        socket.emit("sendMessage", { disputeId, message: newMessage });
      }

      setNewMessage(""); // ✅ Clear the input field after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>QA-Management Chat</Typography>

      {chatData ? (
        <Box sx={{ mb: 2 }}>
          <Typography><strong>QA:</strong> {chatData.dispute.evaluatorName || "Not Found"}</Typography>
          <Typography><strong>Management:</strong> {chatData.dispute.managementName || "Not Found"}</Typography>
          <Typography><strong>Dispute ID:</strong> {disputeId}</Typography>
          <Typography><strong>Agent:</strong> {chatData.dispute.agentName || "Not Found"}</Typography>
        </Box>
      ) : (
        <CircularProgress />
      )}

      <Paper sx={{ p: 2, mb: 2, maxHeight: 400, overflowY: "auto" }}>
        {(messages ?? []).map((msg, index) => (
          <Typography key={index} sx={{ mb: 1, textAlign: msg.senderRole === "Admin" ? "right" : "left" }}>
            <strong>{msg.senderRole}:</strong> {msg.message}
          </Typography>
        ))}
      </Paper>

      <TextField fullWidth multiline rows={2} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
      <Button variant="contained" sx={{ mt: 2 }} onClick={sendMessage}>
        Send Message
      </Button>
    </Box>
  );
}
