import { UdpClient } from "./udpClient";
import { mockUdpServer } from "./mocks/mockUdpServer";
import { OscMessage } from "./OscMessage";

describe("yes", () => {
  test.skip("do it", async () => {
    const serverPtr = mockUdpServer();
    const client = new UdpClient({
      responsePort: 1023,
      remotePort: 9000, // 9000,
      remoteAddress: "192.168.10.40",
    });
    try {
      // await client.connect();
      serverPtr.addMessageHandlerMock((msg, rinfo) => {
        console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
      });
      const response = serverPtr.waitForMessageOnServer();

      await client.send(
        OscMessage.encode("/xinfo", [
          {
            s: "/meters/0",
          },
          {
            i: 100,
          },
        ])

        // Buffer.concat([
        //   // stringToPaddedBuffer("/xinfo"),
        //   // stringToPaddedBuffer("/ch/01/config/icon"),
        //   // stringToPaddedBuffer("/meters"),
        //   stringToPaddedBuffer("/ch/01/gate/thr"),
        //   stringToPaddedBuffer(","),
        //   // stringToPaddedBuffer("/meters/0"),
        // ])
      );
      // await sleep(200);
      const { msg } = await response;
      const message = OscMessage.decode(Uint8Array.from(msg));
      expect(message.address).toBe("/xinfo");
      expect(message.args[0]).toMatchObject({ s: "/meters/0" });
      const [firstArg, secondArg] = message.args;

      expect("s" in firstArg && firstArg.s).toBe("/meters/0");
      expect("i" in secondArg && secondArg.i).toBe(100);
      // const command1 = decodeAndPopString(Uint8Array.from(msg));
      // const command2 = decodeAndPopString(command1.unit8Array);
      // expect(command1.str).toBe("/ch/01/gate/thr");
      // expect(command2.str).toBe(",");
      // await serverPtr.waitForMessageOnServer();
    } catch (e) {
      console.trace(e);
      client.cleanUpController.abort();
      // serverPtr.controller.abort();
    }

    client.cleanUpController.abort();
    serverPtr.controller.abort();
  });
});
