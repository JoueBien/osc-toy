import { decodeAndPopBlob } from "./utils/decoders/decodeAndPopBlob";
import { decodeAndPopFloat } from "./utils/decoders/decodeAndPopFloat";
import { decodeAndPopInit } from "./utils/decoders/decodeAndPopInit";
import { decodeAndPopString } from "./utils/decoders/decodeAndPopString";
import { floatToBuffer } from "./utils/encoders/floatToBuffer";
import { intToBuffer } from "./utils/encoders/intToBuffer";
import { stringToPaddedBuffer } from "./utils/stringToPaddedBuffer";

export type Args =
  | {
      i: number;
    }
  | {
      f: number;
    }
  | {
      s: string;
    }
  | {
      b: unknown;
    }
  | {
      T: true;
    }
  | {
      F: false;
    }
  | {
      I: number;
    }
  | {
      N: null;
    };

// TODO: Will not deal with bad input!
export const OscMessage = {
  decode: function decode(messageBuffer: Buffer) {
    const unit8Array = new Uint8Array(
      messageBuffer.buffer,
      messageBuffer.byteOffset,
      messageBuffer.byteLength
    );

    const { str: address, unit8Array: next1 } = decodeAndPopString(unit8Array);
    const { str: _messageTypes, unit8Array: next2 } = decodeAndPopString(next1);
    const messageTypes = _messageTypes.replace(",", "").split("");

    // Pull args off the rest of the buffer.
    const args = (() => {
      let messageItemBuffer = next2;
      return messageTypes.map((messageType) => {
        // console.log("@@messageType", messageItemBuffer);
        if (messageType === "s") {
          const { str, unit8Array: next } =
            decodeAndPopString(messageItemBuffer);
          messageItemBuffer = next;
          return { s: str };
        }
        if (messageType === "i") {
          const { number, unit8Array: next } =
            decodeAndPopInit(messageItemBuffer);
          messageItemBuffer = next;
          return { i: number };
        }
        if (messageType === "f") {
          const { number, unit8Array: next } =
            decodeAndPopFloat(messageItemBuffer);
          messageItemBuffer = next;
          return { f: number };
        }
        if (messageType === "b") {
          const { blob, unit8Array: next } =
            decodeAndPopBlob(messageItemBuffer);
          messageItemBuffer = next;
          return { b: blob };
        }

        // Non-encoded types.
        if (messageType === "T") {
          return { T: true };
        }
        if (messageType === "F") {
          return { F: false };
        }
        if (messageType === "N") {
          return { N: null };
        }
        if (messageType === "I") {
          return { I: Infinity };
        }

        return undefined;
      });
    })();

    return {
      address: address,
      argTypes: messageTypes,
      args,
    };
  },
  encode: function encode(address: string, argsArray?: Args[]) {
    const args = argsArray || [];
    const argTypes: string = args.reduce((all, current) => {
      return `${all}${Object.keys(current)[0]}`;
    }, "");

    const argsAsBuffer: Buffer[] = (args || [])
      .map((arg) => {
        if ("i" in arg) {
          return intToBuffer(arg.i);
        }
        if ("f" in arg) {
          return floatToBuffer(arg.f);
        }
        if ("s" in arg) {
          return stringToPaddedBuffer(arg.s);
        }
        return undefined;
      })
      .filter((value) => value !== undefined);

    const messageBuffer = Buffer.concat([
      stringToPaddedBuffer(address),
      stringToPaddedBuffer(`,${argTypes}`),
      ...argsAsBuffer,
    ]);

    return messageBuffer;
  },
};
