import LiveService from "../services/live.js";
const liveService = new LiveService();

export const createLive = async (req, res, next) => {
  try {
    const result = await liveService.createLive(req.body.astrologerId);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

export const getAllLive = async (req, res, next) => {
  try {
    const result = await liveService.getAllLive();
    res.send(result);
  } catch (error) {
    next(error);
  }
};
export const getAllActiveLive = async (req, res, next) => {
  try {
    const result = await liveService.getAllActiveLive();
    res.send(result);
  } catch (error) {
    next(error);
  }
};

export const getLiveByAstrologer = async (req, res, next) => {
  try {
    const result = await liveService.getLiveByRoomID(req.params.id);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

export const endLive = async (req, res, next) => {
  try {
    const result = await liveService.endLive(req.body.liveId);
    res.send(result);
  } catch (error) {
    next(error);
  }
};
