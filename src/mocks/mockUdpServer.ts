import dgram from "node:dgram";

export function mockUdpServer() {
  const controller = new AbortController();
  const { signal } = controller;
  const server = dgram.createSocket({ type: "udp4", signal });
  server.bind(9000);
  return {
    controller,
    waitForMessageOnServer: () => {
      const floatingPromise = new Promise<{
        msg: Buffer;
        rinfo: dgram.RemoteInfo;
      }>((resolve) => {
        server.on("message", (msg, rinfo) => {
          // console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
          resolve({ msg, rinfo });
        });
      });
      return floatingPromise;
    },
    addMessageHandlerMock: (
      action: (msg: Buffer, rinfo: dgram.RemoteInfo) => void
    ) => {
      server.on("message", action);

      return function cleanUp() {
        server.off("message", action);
      };
    },
    addMessageHandlerMockOnce: (
      action: (msg: Buffer, rinfo: dgram.RemoteInfo) => void
    ) => {
      server.once("message", action);

      return function cleanUp() {
        server.off("message", action);
      };
    },
  };
}
