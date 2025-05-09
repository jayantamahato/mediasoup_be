// mediasoup.config.js

export default {
  worker: {
    rtcMinPort: 10000,
    rtcMaxPort: 10100,
  },

  router: {
    mediaCodecs: [
      {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2,
        rtcpFeedback: [{ type: "transport-cc" }],
      },
      {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
        parameters: {
          "x-google-start-bitrate": 1000,
        },
        rtcpFeedback: [
          { type: "goog-remb" },
          { type: "transport-cc" },
          { type: "ccm", parameter: "fir" },
          { type: "nack" },
          { type: "nack", parameter: "pli" },
        ],
      },
    ],
  },

  webRtcTransport: {
    listenIps: [
      {
        ip: "0.0.0.0", // Server public ip
        announcedIp: "192.168.1.22", //server public ip
      },
    ],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    // initialAvailableOutgoingBitrate: 1000000
  },
};
