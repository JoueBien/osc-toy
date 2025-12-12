import { textEncoder } from "./../encoders/baseEncoders";

const BUFFER_PADDING = {
  0: Buffer.from(""),
  1: Buffer.from(textEncoder.encode("\x00")),
  2: Buffer.from(textEncoder.encode("\x00\x00")),
  3: Buffer.from(textEncoder.encode("\x00\x00\x00")),
  4: Buffer.from(textEncoder.encode("\x00\x00\x00\x00")),
};

export function calcStringBufferPadding(strBuffer: Uint8Array<ArrayBuffer>) {
  const paddingNo = 4 - (strBuffer.length % 4);
  return paddingNo;
}

/** Convert a string to a buffer and make sure it is 4 aligned with null characters. */
export function stringToPaddedBuffer(str: string): Uint8Array<ArrayBuffer> {
  const bufferStr = Buffer.from(textEncoder.encode(str));
  const paddingNo = calcStringBufferPadding(bufferStr);
  const paddedBuffer = Buffer.concat([bufferStr, BUFFER_PADDING[paddingNo]]);

  return paddedBuffer;
}
