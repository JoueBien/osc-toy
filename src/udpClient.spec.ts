import { MockUdpServer, mockUdpServer } from "./mocks/mockUdpServer";
import { OscMessage } from "./OscMessage";
import { UdpClient } from "./udpClient";

let serverPtr: MockUdpServer;

describe("udpClient", () => {
  beforeAll(() => {
    serverPtr = mockUdpServer();
  });

  afterAll(() => {
    serverPtr.controller.abort();
  });

  it("isConnectionOk reports state correctly", async () => {
    const client = new UdpClient({
      remotePort: 9000,
      responsePort: 9001,
    });

    // Check connection error
    const connectNotRunError = await client.isConnectionOk();
    expect(connectNotRunError).toMatchObject({
      type: "not-connected",
    });

    // Check reports okay after connection
    await client.connect();
    const connectionOkay = await client.isConnectionOk();
    expect(connectionOkay).toBe("ok");

    // Check aborted error
    client.cleanUpController.abort();
    const connectionAbortedError = await client.isConnectionOk();
    expect(connectionAbortedError).toMatchObject({
      type: "aborted",
    });

    // Clean up at end.
    client.cleanUpController.abort();
  });

  it("sends a message", async () => {
    const client = new UdpClient({
      remotePort: 9000,
      responsePort: 9001,
    });

    await client.connect();
    const sendMessage = OscMessage.encode("/send/test", [
      {
        f: 1234,
      },
    ]);

    const response =
      serverPtr.waitForSpecificOscMessageOnServerOnce("/send/test");
    await client.send(sendMessage);

    const messageReceived = await response;

    expect(messageReceived).toMatchObject({
      address: "/send/test",
      argTypes: ["f"],
      args: [
        {
          f: 1234,
        },
      ],
    });
    client.cleanUpController.abort();
  });

  it("send won't send a message if not connected", async () => {
    const client = new UdpClient({
      remotePort: 9000,
      responsePort: 9001,
    });

    const sendMessage = OscMessage.encode("/send/test", [
      {
        f: 1234,
      },
    ]);

    const res = await client.send(sendMessage);

    expect(res).toMatchObject({
      type: "not-connected",
    });

    client.cleanUpController.abort();
  });
});
