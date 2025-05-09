import { mediaSoupSignaling } from "../signaling/mediaSoup.js";

const signalling = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    mediaSoupSignaling(socket);

    //create a room for live session
    socket.on("joinRoom", (data) => {
      const { roomId, user } = data;
      socket.join(roomId);
      console.log("Client joined room:", roomId);
      socket.emit("userJoined", { user: user });
    });
    //comment
    socket.on("comment", (data) => {
      io.to(data.roomId).emit("comment", data);
    });

    //leaving from a room
    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
      console.log("Client left room:", roomId);
      socket.to(roomId).emit("userLeft", { user: data.user });
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
