import { intToBuffer } from "../encoders/intToBuffer";
import { decodeAndPopInit } from "./decodeAndPopInit";

export function decodeAndPopBlob(unit8Buf: Uint8Array) {
  // Broken!!!
  // <blob size><no of data><....blob data>
  const { number: bufferSize, unit8Array: _blob8Array } =
    decodeAndPopInit(unit8Buf);
  // console.log("@@@bufferSize", bufferSize);
  const blob8Array = _blob8Array.slice(0, bufferSize * 4);
  const nextBuf = _blob8Array.slice(bufferSize * 4);
  // console.log("@@@bufferSize", bufferSize * 4);
  // console.log("@@@nextBuf", nextBuf);
  return {
    blob: blob8Array,
    unit8Array: nextBuf,
  };
}

export function encode(buffer: Buffer) {
  const size = buffer.length / 4;
  return Buffer.concat([intToBuffer(size), buffer]);
}
