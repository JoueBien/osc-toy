export function decodeAndPopInit(unit8Buf: Uint8Array<ArrayBuffer>) {
  const intBuf = unit8Buf.slice(0, 4).reverse();
  const [number] = Array.from(
    new Int32Array(intBuf.buffer, intBuf.byteOffset, intBuf.byteLength / 4)
  );
  const nextBuf = unit8Buf.slice(4);
  return {
    number,
    unit8Array: nextBuf,
  };
}
