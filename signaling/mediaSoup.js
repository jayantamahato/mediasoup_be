import {
  createRouter,
  createTransport,
  createWorker,
} from "../services/mediaSoup.js";

let worker;
let router;
let sendTransport;
let producer;
//consumer
let receiveTransport;
let consumer;
export const mediaSoupSignaling = (socket) => {
  socket.on("getRouterRtpCapabilities", async () => {
    if (!worker) {
      worker = await createWorker();
    }
    router = await createRouter(worker);
    const rtpCapabilities = router.rtpCapabilities;
    console.log("RTP Capabilities", rtpCapabilities);
    socket.emit("routerRtpCapabilities", rtpCapabilities);
  });
  socket.on("createSendTransport", async () => {
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
    console.log("Producer ID: ", producer.id, producer.kind);
    producer.on("transportclose", () => {
      console.log("transport for this producer closed ");
      producer.close();
    });
    console.log("producer transport ", producer.rtpCapabilities);
    console.log("producer transport ", producer.rtpParameters);
    socket.emit("produced", {
      id: producer.id,
      kind: producer.kind,
    });
  });
  //consumer
  socket.on("createConsumerTransport", async () => {
    try {
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
    console.log(
      "Can consume:",
      router.canConsume({
        producerId: producer.id,
        rtpCapabilities: data.rtpCapabilities,
      })
    );
    if (
      !router.canConsume({
        producerId: producer.id,
        rtpCapabilities: data.rtpCapabilities,
      })
    ) {
      return;
    }
    consumer = await receiveTransport.consume({
      producerId: producer.id,
      rtpCapabilities: data.rtpCapabilities,
      paused: true,
    });
    consumer.on("transportclose", () => {
      console.log("transport close from consumer");
    });

    consumer.on("producerclose", () => {
      console.log("producer of consumer closed");
    });
    console.log(consumer.peerId);
    const params = {
      id: consumer.id,
      producerId: producer.id,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
      peerId: "",
    };
    socket.emit("consumed", params);
  });
  socket.on("consumerResume", async (data) => {
    try {
      await consumer.resume();
      console.log("Resumed");
    } catch (error) {
      console.log("ERROR IN RESUMING CONSUMER", error);
    }
    // await consumer.resume();
  });
};
