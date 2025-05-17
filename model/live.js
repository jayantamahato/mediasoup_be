import mongoose from "mongoose";
const liveSchema = new mongoose.Schema(
  {
    astrologerId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive"],
    },
    roomId: {
      type: String,
      required: true,
      unique: true,
    },
    callingRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "callingRoom",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const LiveModel = mongoose.model("live", liveSchema);

export default LiveModel;
