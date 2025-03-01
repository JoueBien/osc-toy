import { intEncoder } from "./baseEncoders";

/** Encode int to buffer and reverse the bits. */
export function intToBuffer(num: number) {
  return Buffer.from(intEncoder.encode(num)).reverse();
}
