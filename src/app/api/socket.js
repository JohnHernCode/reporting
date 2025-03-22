import { Server } from "socket.io";

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log("🚀 Initializing WebSocket server...");
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
      console.log("🔌 New client connected:", socket.id);

      socket.on("joinChat", (disputeId) => {
        console.log(`🛜 User joined chat room: ${disputeId}`);
        socket.join(disputeId);
      });

      socket.on("sendMessage", (message) => {
        console.log("📩 Message received:", message);
        io.to(message.disputeId).emit("newMessage", message);
      });

      socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
  } else {
    console.log("✅ WebSocket server already initialized.");
  }

  res.end();
}
