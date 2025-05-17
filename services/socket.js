import { mediaSoupSignaling } from "../signaling/mediaSoup.js";
import LiveService from "./live.js";

const signalling = (io) => {
  const liveservice = new LiveService();
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    mediaSoupSignaling(socket);

    //create a room for live session
    socket.on("joinRoom", async (data) => {
      const { roomId, user } = data;
      const live = await liveservice.getActiveLiveById(roomId);
      console.log(roomId);
      if (!live) {
        console.log("Joining room - Room not found");
        socket.emit("error", {
          message: "Room not found",
        });
        return;
      }
      socket.join(roomId);
      console.log("Client joined room:", roomId);
      socket.emit("userJoined", { user: user, roomId: roomId });
    });
    //comment
    socket.on("comment", (data) => {
      io.to(data.roomId).emit("comment", data);
    });

    //leaving from a room
    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
      console.log("Client left room:", roomId);
      socket.to(roomId).emit("userLeft", { roomId: roomId });
    });

    //end a live session
    socket.on("endLive", (roomId) => {
      socket.leave(roomId);
      console.log("Client left room:", roomId);
      socket.to(roomId).emit("liveEnd");
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};
export default signalling;
