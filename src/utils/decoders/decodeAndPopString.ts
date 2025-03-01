import { textDecoder } from "../encoders/baseEncoders";
import { calcStringBufferPadding } from "./../stringToPaddedBuffer";

export function decodeAndPopString(unit8Buf: Uint8Array) {
  const strEndsAt = unit8Buf.indexOf(0);
  const strBuffer = unit8Buf.slice(0, strEndsAt);
  const str = textDecoder.write(strBuffer);

  const paddingEndsAt = strEndsAt + calcStringBufferPadding(strBuffer);

  return {
    str,
    unit8Array: unit8Buf.slice(paddingEndsAt),
  };
}
