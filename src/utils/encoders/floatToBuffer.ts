import { floatEncoder } from "./baseEncoders";

/** Encode int to buffer and reverse the bits. */
export function floatToBuffer(num: number) {
  return Buffer.from(floatEncoder.encode(num)).reverse();
}
