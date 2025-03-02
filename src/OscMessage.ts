import { decodeAndPopBlob } from "./utils/decoders/decodeAndPopBlob";
import { decodeAndPopFloat } from "./utils/decoders/decodeAndPopFloat";
import { decodeAndPopInit } from "./utils/decoders/decodeAndPopInit";
import { decodeAndPopString } from "./utils/decoders/decodeAndPopString";
import { bufferToPaddedBuffer } from "./utils/encoders/bufferToPaddedBuffer";
import { floatToBuffer } from "./utils/encoders/floatToBuffer";
import { intToBuffer } from "./utils/encoders/intToBuffer";
import { stringToPaddedBuffer } from "./utils/encoders/stringToPaddedBuffer";

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
      b: Buffer;
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
    // argTypes are optional in 1.1 - not handled as per the 1.0.
    const argTypes = _messageTypes.replace(",", "").split("");

    // Pull args  out of the rest of the buffer.
    const args = (() => {
      let messageItemBuffer = next2;
      return argTypes.map((argType) => {
        switch (argType) {
          // Encoded types
          case "s": {
            const { str, unit8Array: next } =
              decodeAndPopString(messageItemBuffer);
            messageItemBuffer = next;
            return { s: str };
          }
          case "i": {
            const { number, unit8Array: next } =
              decodeAndPopInit(messageItemBuffer);
            messageItemBuffer = next;
            return { i: number };
          }
          case "f": {
            const { number, unit8Array: next } =
              decodeAndPopFloat(messageItemBuffer);
            messageItemBuffer = next;
            return { f: number };
          }
          case "b": {
            const { blob, unit8Array: next } =
              decodeAndPopBlob(messageItemBuffer);
            messageItemBuffer = next;
            return { b: blob };
          }
          // Non-encoded types.
          case "T":
            return { T: true };
          case "F":
            return { F: false };
          case "N":
            return { N: null };
          case "I":
            return { I: Infinity };
        }
        return undefined;
      });
    })();

    return {
      address: address,
      argTypes,
      args,
    };
  },
  encode: function encode(address: string, argsArray?: Args[]) {
    const args = argsArray || [];
    // Get the OSC type list
    const argTypes: string = args.reduce((all, current) => {
      return `${all}${Object.keys(current)[0]}`;
    }, "");

    // Encode ars into the buffer
    const argsAsBuffer: Buffer[] = (args || [])
      .map((arg) => {
        switch (true) {
          case "i" in arg:
            return intToBuffer(arg.i);
          case "f" in arg:
            return floatToBuffer(arg.f);
          case "s" in arg:
            return stringToPaddedBuffer(arg.s);
          case "b" in arg:
            bufferToPaddedBuffer(arg.b);
        }
        return undefined;
      })
      .filter((value) => value !== undefined);

    // Merge message, type list and args into single buffer
    const messageBuffer = Buffer.concat([
      stringToPaddedBuffer(address),
      // argTypes are optional in 1.1 - not handled as per the 1.0.
      stringToPaddedBuffer(`,${argTypes}`),
      ...argsAsBuffer,
    ]);

    return messageBuffer;
  },
};
