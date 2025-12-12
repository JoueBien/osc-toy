import { textEncoder } from "../encoders/baseEncoders";
import { intToBuffer } from "../encoders/intToBuffer";

const BUFFER_PADDING = {
  0: Buffer.from(""),
  1: Buffer.from(textEncoder.encode("\x00")),
  2: Buffer.from(textEncoder.encode("\x00\x00")),
  3: Buffer.from(textEncoder.encode("\x00\x00\x00")),
  4: Buffer.from(textEncoder.encode("")),
};

/**
 * Blobs are encoded as follows:
 * <size int32><....data>
 * data must be 4 byte aligned/padded.
 *
 * The X32 also provides a number of values
 * <size int32><values int32><....data>
 * <values int32> is encoded backwards & so is the data.
 */

export function calcBufferPadding(strBuffer: Uint8Array<ArrayBuffer>) {
  const paddingNo = 4 - (strBuffer.length % 4);
  return paddingNo;
}

export function bufferToPaddedBuffer(buffer: Uint8Array<ArrayBuffer>) {
  const paddingNo = calcBufferPadding(buffer);
  const paddedBuffer = Buffer.concat([buffer, BUFFER_PADDING[paddingNo]]);
  const size = paddedBuffer.length / 4;

  return Buffer.concat([intToBuffer(size), paddedBuffer]);
}
