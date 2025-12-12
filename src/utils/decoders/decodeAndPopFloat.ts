export function decodeAndPopFloat(unit8Buf: Uint8Array<ArrayBuffer>) {
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
