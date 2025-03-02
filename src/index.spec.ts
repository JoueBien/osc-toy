import { UdpClient } from "./udpClient";

import { decodeAndPopString } from "./utils/decoders/decodeAndPopString";
import { decodeAndPopInit } from "./utils/decoders/decodeAndPopInit";
import { decodeAndPopFloat } from "./utils/decoders/decodeAndPopFloat";
import { decodeAndPopBlob } from "./utils/decoders/decodeAndPopBlob";
import { stringToPaddedBuffer } from "./utils/encoders/stringToPaddedBuffer";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function decodeMessage(buffMessage: Buffer) {
  console.log("@buffMessage", buffMessage);
  const unit8Array = new Uint8Array(
    buffMessage.buffer,
    buffMessage.byteOffset,
    buffMessage.byteLength
  );

  // TODO: Bad input not checked!
  const { str: address, unit8Array: next1 } = decodeAndPopString(unit8Array);
  const { str: _messageTypes, unit8Array: next2 } = decodeAndPopString(next1);
  const messageTypes = _messageTypes.replace(",", "").split("");

  // Pull args off the rest of the buffer.
  const args = (() => {
    let messageItemBuffer = next2;
    return messageTypes.map((messageType) => {
      console.log("@@messageType", messageItemBuffer);
      if (messageType === "s") {
        const { str, unit8Array: next } = decodeAndPopString(messageItemBuffer);
        messageItemBuffer = next;
        return str;
      }
      if (messageType === "i") {
        const { number, unit8Array: next } =
          decodeAndPopInit(messageItemBuffer);
        messageItemBuffer = next;
        return number;
      }
      if (messageType === "f") {
        const { number, unit8Array: next } =
          decodeAndPopFloat(messageItemBuffer);
        messageItemBuffer = next;
        return number;
      }
      if (messageType === "b") {
        const { blob, unit8Array: next } = decodeAndPopBlob(messageItemBuffer);
        messageItemBuffer = next;
        return blob;
      }

      // Non-encoded types.
      if (messageType === "T") {
        return true;
      }
      if (messageType === "F") {
        return true;
      }
      if (messageType === "N") {
        return null;
      }
      if (messageType === "I") {
        return Infinity;
      }

      return undefined;
    });
  })();

  return {
    address,
    messageTypes,
    args: args,
  };
}

describe("yes", () => {
  test("do it", async () => {
    // const serverPtr = mockUdpServer();
    const client = new UdpClient({
      responsePort: 9000,
      remotePort: 10023, // 9000,
      remoteAddress: "192.168.10.40",
    });
    try {
      await client.connect();
      // client.onMessage((message) =>
      //   // console.log("@@@return", decodeMessage(message))
      // );
      await client.send(
        Buffer.concat([
          // stringToPaddedBuffer("/xinfo"),
          // stringToPaddedBuffer("/ch/01/config/icon"),
          // stringToPaddedBuffer("/meters"),
          stringToPaddedBuffer("/ch/01/gate/thr"),
          stringToPaddedBuffer(","),
          // stringToPaddedBuffer("/meters/0"),
        ])
      );
      await sleep(200);
      // await serverPtr.waitForMessageOnServer();
    } catch (e) {
      console.log(e);
      client.cleanUpController.abort();
      // serverPtr.controller.abort();
    }

    client.cleanUpController.abort();
    // serverPtr.controller.abort();
  });
});
