import LiveModel from "../model/live.js";
import AppError from "../utils/error.js";
import httpCode from "../utils/httpStatus.js";

class LiveService {
  async getAllLive() {
    try {
      const result = await LiveModel.find();
      return result;
    } catch (error) {
      throw error;
    }
  }
  async getAllLiveByAstrologer(astrologerId) {
    try {
      const result = await LiveModel.find({ astrologerId });

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
  async createLive(astrologerId) {
    try {
      if (!astrologerId) {
        throw new AppError("astrologerId is required", httpCode.BAD_REQUEST);
      }
      const liveData = {
        astrologerId,
        status: "active",
        roomId: astrologerId,
      };
      const result = await LiveModel.create(liveData);
      //change the status of astrologer
      //send notification to all followed user

      return result;
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
      //   change the status of astrologer
      return result;
    } catch (error) {
      throw error;
    }
  }
}
export default LiveService;
