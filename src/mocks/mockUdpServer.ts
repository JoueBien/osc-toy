import dgram from "node:dgram";
import { Arg, DecodedOscMessage, OscMessage } from "../OscMessage";

export type MockUdpServer = ReturnType<typeof mockUdpServer>;

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

    waitForSpecificOscMessageOnServerOnce: (address: string) => {
      const floatingPromise = new Promise<DecodedOscMessage<Arg[]>>(
        (resolve) => {
          server.once("message", (msg, rinfo) => {
            const decoded = OscMessage.decode(Uint8Array.from(msg));
            if (decoded.address === address) {
              resolve(decoded);
            }
            // console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
          });
        }
      );
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
