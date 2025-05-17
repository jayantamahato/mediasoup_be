import * as mediasoup from "mediasoup";
import mediaSoupConfig from "../mediaSoup.config.js";
let worker;
const createWorker = async () => {
  try {
    if (worker) {
      return worker;
    }
    worker = await mediasoup.createWorker(mediaSoupConfig.worker);
    console.warn("\n::::Worker created::::\n");
    return worker;
  } catch (error) {
    console.log("ERROR IN CREATING WORKER", error);
  }
};
const createRouter = async (worker) => {
  try {
    const router = await worker.createRouter(mediaSoupConfig.router);
    console.warn("\n::::Router created::::\n");

    return router;
  } catch (error) {
    console.log("ERROR IN CREATING ROUTER", error);
  }
};
const createTransport = async (router) => {
  try {
    const transport = await router.createWebRtcTransport({
      listenIps: [{ ip: "0.0.0.0", announcedIp: "192.168.1.125" }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });
    transport.on("dtlsstatechange", (dtlsState) => {
      if (dtlsState === "closed") {
        transport.close();
      }
    });
    transport.on("close", () => {
      console.log("Transport closed");
    });
    console.warn("\n::::Transport created::::\n");

    return transport;
  } catch (error) {
    console.log("ERROR IN CREATING TRANSPORT", error);
  }
};
const createProducer = async (transport, data) => {
  try {
    const produce = await transport.produce({
      kind: data.kind,
      rtpParameters: data.rtpParameters,
      appData: data.appData,
    });
    console.warn("\n::::Producer created::::\n");
    console.log(`Producer kind: ${producer.kind}, id: ${producer.id}`);
    return produce;
  } catch (error) {
    console.log("ERROR IN CREATING PRODUCER", error);
  }
};

const createConsumer = async (transport, data) => {
  try {
    const consumer = await transport.consume({
      producerId: data.producerId,
      rtpParameters: data.rtpParameters,
      paused: data.paused,
    });
    console.warn("\n::::CONSUMER created::::\n");
    console.log(consumer.id, consumer.kind);
    return consumer;
  } catch (error) {
    console.log("ERROR IN CREATING CONSUMER", error);
  }
};
export {
  createWorker,
  createRouter,
  createTransport,
  createProducer,
  createConsumer,
};
