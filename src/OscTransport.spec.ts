import { describe, expect, it } from "vitest";
import { setupClient } from "./testing/setupClient.ts";
import { setupServer } from "./testing/setupServer.ts";
import { sendAndWaitFor } from "@joue-bien/audio-transport/utils/async";

describe("OscTransport", () => {
  const { getCurrentClient } = setupClient();
  const { getCurrentServer } = setupServer();

  it("sends a message", async () => {
    const client = getCurrentClient();
    const server = getCurrentServer();
    await client.connect();
    await server.listen();

    const connectionOk = await client.isConnectionOk();

    const [message, sendRes] = await sendAndWaitFor({
      send: async () => {
        return client.send({
          address: "/xinfo",
          args: [{ i: 1234 }],
        });
      },
      waitFor: async () => {
        return server.waitForMessage({ address: "/xinfo" });
      },
    });

    expect(connectionOk).toBe("ok");
    expect(sendRes).toBe("ok");
    expect(message).toMatchObject({
      msg: expect.any(Buffer),
      decoded: {
        address: "/xinfo",
        argTypes: ["i"],
      },
      rinfo: { address: "127.0.0.1", family: "IPv4", port: 9001, size: 16 },
    });
  });

  it("responds can send message to remote connections", async () => {
    const client = getCurrentClient();
    const server = getCurrentServer();
    await client.connect();
    await server.listen();

    const [res] = await sendAndWaitFor({
      send: async () => {
        return server.respond({
          address: "/message",
          args: [{ i: 1234 }],
          remoteAddress: "localhost",
          remotePort: 9001,
        });
      },
      waitFor: async () => {
        return client.waitForMessage({
          address: "/message",
        });
      },
    });

    const connectionOk = await server.isListeningOk();

    expect(connectionOk).toBe("ok");

    expect(res).toMatchObject({
      msg: expect.any(Buffer),
      decoded: {
        address: "/message",
        argTypes: ["i"],
      },
      rinfo: { address: "127.0.0.1", family: "IPv4", port: 9000, size: 20 },
    });
  });
});
