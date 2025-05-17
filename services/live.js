import LiveModel from "../model/live.js";
import AppError from "../utils/error.js";
import httpCode from "../utils/httpStatus.js";
import { createRouter, createWorker } from "./mediaSoup.js";

class LiveService {
  async getAllLive() {
    try {
      const result = await LiveModel.find();
      return result;
    } catch (error) {
      throw error;
    }
  }
  async getLiveByRoomID(id) {
    try {
      const result = await LiveModel.find({ astrologerId: id });

      return result;
    } catch (error) {
      throw error;
    }
  }
  async getAllActiveLive() {
    try {
      const result = await LiveModel.find({ status: "active" });
      return result;
    } catch (error) {
      throw error;
    }
  }
  async getActiveLiveById(roomId) {
    try {
      const result = await LiveModel.findOne({ roomId, status: "active" });
      return result;
    } catch (error) {
      throw error;
    }
  }
  async createLive(astrologerId) {
    try {
      if (!astrologerId || astrologerId === "") {
        throw new AppError("astrologerId is required", httpCode.BAD_REQUEST);
      }

      const live = await LiveModel.findOne({ astrologerId, status: "active" });
      if (live) {
        throw new AppError(live.roomId, httpCode.BAD_REQUEST);
      }
      const liveData = {
        astrologerId,
        status: "active",
        roomId: Date.now().toString(),
      };
      const result = await LiveModel.create(liveData);
      //change the status of astrologer
      //send notification to all followed user
      return result.roomId;
    } catch (error) {
      throw error;
    }
  }
  async endLive(liveId) {
    try {
      if (!liveId) {
        throw new AppError("liveId is required", httpCode.BAD_REQUEST);
      }
      const result = await LiveModel.findByIdAndUpdate(liveId, {
        status: "inactive",
      });

      return result;
    } catch (error) {
      throw error;
    }
  }
}
export default LiveService;
