import { decodeAndPopInit } from "./decodeAndPopInit";

/**
 * Blobs are encoded as follows:
 * <size int32><....data>
 * data must be 4 byte aligned/padded.
 *
 * The X32 also provides a number of values
 * <size int32><values int32><....data>
 * <values int32> is encoded backwards & so is the data.
 */

export function decodeAndPopBlob(unit8Buf: Uint8Array<ArrayBuffer>) {
  const { number: bufferSize, unit8Array: _blob8Array } =
    decodeAndPopInit(unit8Buf);
  const blob8Array = _blob8Array.slice(0, bufferSize * 4);
  const nextBuf = _blob8Array.slice(bufferSize * 4);

  return {
    blob: blob8Array,
    unit8Array: nextBuf,
  };
}
