import { textDecoder } from "./encoders";
import { calcStringBufferPadding } from "./stringToPaddedBuffer";

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

export function decodeAndPopBlob(unit8Buf: Uint8Array) {
  // Broken!!!
  // <blob size><no of data><....blob data>
  const { number: bufferSize, unit8Array: _blob8Array } =
    decodeAndPopInit(unit8Buf);
  // console.log("@@@bufferSize", bufferSize);
  const blob8Array = _blob8Array.slice(0, bufferSize * 4);
  const nextBuf = _blob8Array.slice(bufferSize * 4);
  console.log("@@@bufferSize", bufferSize * 4);
  console.log("@@@nextBuf", nextBuf);
  return {
    blob: blob8Array,
    unit8Array: nextBuf,
  };
}

export function decodeAndPopInit(unit8Buf: Uint8Array) {
  const intBuf = unit8Buf.slice(0, 4).reverse();
  const [number] = Array.from(
    new Int32Array(intBuf.buffer, intBuf.byteOffset, intBuf.byteLength / 4)
  );
  const nextBuf = unit8Buf.slice(4);
  // console.log("@@@nextBuf", nextBuf);
  return {
    number,
    unit8Array: nextBuf,
  };
}

export function decodeAndPopFloat(unit8Buf: Uint8Array) {
  const intBuf = unit8Buf.slice(0, 4).reverse();
  const [number] = Array.from(
    new Float32Array(intBuf.buffer, intBuf.byteOffset, intBuf.byteLength / 4)
  );
  const nextBuf = unit8Buf.slice(4);
  // console.log("@@@nextBuf", nextBuf);
  return {
    number,
    unit8Array: nextBuf,
  };
}
