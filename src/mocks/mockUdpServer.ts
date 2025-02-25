import dgram from "node:dgram";

export function mockUdpServer() {
  const controller = new AbortController();
  const { signal } = controller;
  const server = dgram.createSocket({ type: "udp4", signal });
  server.bind(9000);
  return {
    controller,
    waitForMessageOnServer: () => {
      const floatingPromise = new Promise<void>((resolve) => {
        server.on("message", (msg, rinfo) => {
          console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
          resolve();
        });
      });
      return floatingPromise;
    },
  };
}
