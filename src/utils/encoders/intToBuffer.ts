import { intEncoder } from "./baseEncoders";

/** Encode int to buffer and reverse the bits. */
export function intToBuffer(num: number): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(intEncoder.encode(num)).reverse();
}
