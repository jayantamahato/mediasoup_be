import mongoose from "mongoose";

const callingRoomSchema = new mongoose.Schema({
  liveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "live",
    required: true,
  },
  users: [
    {
      userId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      duration: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        default: "onCall",
        enum: ["onCall", "done", "waiting"],
      },
    },
  ],
});
const CallingRoom = mongoose.model("callingRoom", callingRoomSchema);

export default CallingRoom;
