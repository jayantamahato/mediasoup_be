import LiveService from "../services/live.js";
import {
  createRouter,
  createTransport,
  createWorker,
} from "../services/mediaSoup.js";
let sendTransport;
let producer;
let router;
//consumer
let receiveTransport;
let audioConsumer;
let videoConsumer;
const rooms = new Map();
const producerRoom = new Map();
export const mediaSoupSignaling = (socket) => {
  socket.on("getRouterRtpCapabilities", async ({ roomId }) => {
    const worker = await createWorker();
    console.log(roomId);
    if (!rooms.has(roomId)) {
      console.log("router not exists");
      router = await createRouter(worker);
      rooms.set(roomId, router);
    }
    router = rooms.get(roomId);
    rooms.set(roomId, router);
    if (!producerRoom.has(roomId)) {
      producerRoom.set(roomId, new Map());
    }
    const live = await new LiveService().getActiveLiveById(roomId);
    if (!live) {
      socket.emit("error", {
        message: "rtp capability-  Room not found",
      });
      return;
    }
    const rtpCapabilities = router.rtpCapabilities;
    socket.emit("routerRtpCapabilities", rtpCapabilities);
  });

  //producer
  socket.on("createSendTransport", async ({ roomId }) => {
    const router = rooms.get(roomId);
    sendTransport = await createTransport(router);

    socket.emit("sendTransportCreated", {
      id: sendTransport.id,
      iceParameters: sendTransport.iceParameters,
      iceCandidates: sendTransport.iceCandidates,
      dtlsParameters: sendTransport.dtlsParameters,
    });
  });
  socket.on("connectSendTransport", async (data) => {
    try {
      console.log("connecting send transport");
      await sendTransport.connect({
        dtlsParameters: data.dtlsParameters,
      });
      socket.emit("sendTransportConnected");
    } catch (error) {
      console.log("ERROR IN CONNECTING SEND TRANSPORT", error);
    }
  });
  socket.on("produce", async (data) => {
    console.log("producing client");

    producer = await sendTransport.produce({
      kind: data.kind,
      rtpParameters: data.rtpParameters,
    });

    const room = producerRoom.get(data.roomId);
    console.log("room", room);
    if (!room.has(data.userId)) {
      room.set(data.userId, new Map());
    }

    //set producer id
    const client = room.get(data.userId);
    console.log("client", client);
    if (!client.has(producer.kind)) {
      client.set(producer.kind, producer.id);
    }

    producer.on("transportclose", () => {
      console.log("transport for this producer closed ");
      producer.close();
    });
    socket.emit("produced", {
      id: producer.id,
      kind: producer.kind,
    });
  });

  //main stream
  socket.on("leaveStream", async ({ roomId, user }) => {
    if (user.type == "admin") {
      producerRoom.delete(roomId);
      rooms.delete(roomId);
      socket.emit("liveEnded");

      const live = await new LiveService().getLiveByRoomID(user.userId);

      console.log("live", user.userId);
      if (live.length !== 0) {
        live[0].status = "inactive";
        await live[0].save();
      }
    } else {
      socket.emit("leave", {
        user: user,
      });
    }
  });

  //consumer

  socket.on("createConsumerTransport", async ({ roomId }) => {
    try {
      const router = rooms.get(roomId);
      receiveTransport = await createTransport(router);
      socket.emit("consumerTransportCreated", {
        id: receiveTransport.id,
        iceParameters: receiveTransport.iceParameters,
        iceCandidates: receiveTransport.iceCandidates,
        dtlsParameters: receiveTransport.dtlsParameters,
      });
    } catch (error) {
      console.log("ERROR IN CREATING RECEIVE/CONSUME TRANSPORT", error);
    }
  });
  socket.on("receiveTransportConnect", async (data) => {
    try {
      await receiveTransport.connect({
        dtlsParameters: data.dtlsParameters,
      });
      socket.emit("receiveTransportConnected");
    } catch (error) {
      console.log("ERROR IN CONNECTING RECEIVE TRANSPORT", error);
    }
  });
  socket.on("consume", async (data) => {
    let listOfProducers = [];
    //get all producers
    const room = producerRoom.get(data.roomId);
    for (let producer of room.values()) {
      listOfProducers.push(producer);
    }
    const router = rooms.get(data.roomId);

    console.log("LIST OF PRODUCERS", listOfProducers);

    listOfProducers.forEach(async (producer) => {
      console.log("PRODUCER", producer);
      console.log(
        "Can consume audio:",
        router.canConsume({
          producerId: producer.get("audio"),
          rtpCapabilities: data.rtpCapabilities,
        })
      );
      console.log(
        "Can consume video:",
        router.canConsume({
          producerId: producer.get("video"),
          rtpCapabilities: data.rtpCapabilities,
        })
      );

      audioConsumer = await receiveTransport.consume({
        producerId: producer.get("audio"),
        rtpCapabilities: data.rtpCapabilities,
        paused: true,
      });

      videoConsumer = await receiveTransport.consume({
        producerId: producer.get("video"),
        rtpCapabilities: data.rtpCapabilities,
        paused: true,
      });
      audioConsumer.on("transportclose", () => {
        console.log("transport close from consumer");
      });

      audioConsumer.on("producerclose", () => {
        console.log("producer of consumer closed");
      });
      videoConsumer.on("transportclose", () => {
        console.log("transport close from consumer");
      });

      videoConsumer.on("producerclose", () => {
        console.log("producer of consumer closed");
      });

      const audioParams = {
        id: audioConsumer.id,
        producerId: producer.get("audio"),
        kind: audioConsumer.kind,
        rtpParameters: audioConsumer.rtpParameters,
        peerId: "",
      };
      const videoParams = {
        id: videoConsumer.id,
        producerId: producer.get("video"),
        kind: videoConsumer.kind,
        rtpParameters: videoConsumer.rtpParameters,
        peerId: "",
      };
      socket.emit("video-consumed", videoParams);
      socket.emit("audio-consumed", audioParams);
    });
    return;
  });
  socket.on("consumerResume", async (data) => {
    try {
      await audioConsumer.resume();
      await videoConsumer.resume();
      console.log("Resumed");
    } catch (error) {
      console.log("ERROR IN RESUMING CONSUMER", error);
    }
    // await consumer.resume();
  });
};
