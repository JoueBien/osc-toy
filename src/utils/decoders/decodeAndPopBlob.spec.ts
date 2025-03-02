import { textEncoder } from "../encoders/baseEncoders";
import { bufferToPaddedBuffer } from "../encoders/bufferToPaddedBuffer";
import { floatToBuffer } from "../encoders/floatToBuffer";
import { intToBuffer } from "../encoders/intToBuffer";
import { stringToPaddedBuffer } from "../encoders/stringToPaddedBuffer";

import { decodeAndPopBlob } from "./decodeAndPopBlob";
import { decodeAndPopFloat } from "./decodeAndPopFloat";
import { decodeAndPopInit } from "./decodeAndPopInit";
import { decodeAndPopString } from "./decodeAndPopString";

describe("decodeAndPopBlob", () => {
  it("encodes and decodes", () => {
    const input = bufferToPaddedBuffer(
      Buffer.concat([
        intToBuffer(12134),
        floatToBuffer(1234.1234),
        stringToPaddedBuffer("athing"),
      ])
    );
    const { number: res1, unit8Array: unit8Array1 } = decodeAndPopInit(
      decodeAndPopBlob(input).blob
    );
    const { number: res2, unit8Array: unit8Array2 } =
      decodeAndPopFloat(unit8Array1);
    const { str: res3, unit8Array: unit8Array3 } =
      decodeAndPopString(unit8Array2);

    expect(res1).toBe(12134);
    expect(res2).toBe(1234.1234130859375);
    expect(res3).toBe("athing");
    expect(unit8Array3.length).toBe(0);
  });

  it("1 byte is padded with 000", () => {
    const input = bufferToPaddedBuffer(Buffer.from(textEncoder.encode("1")));
    const res = decodeAndPopBlob(input);
    expect(res.blob.length).toBe(4);
  });

  it("2 byte is padded with 00s", () => {
    const input = bufferToPaddedBuffer(Buffer.from(textEncoder.encode("12")));
    const res = decodeAndPopBlob(input);
    expect(res.blob.length).toBe(4);
  });

  it("3 byte is padded with 0", () => {
    const input = bufferToPaddedBuffer(Buffer.from(textEncoder.encode("123")));
    const res = decodeAndPopBlob(input);
    expect(res.blob.length).toBe(4);
  });

  it("4 byte has no padding", () => {
    const input = bufferToPaddedBuffer(Buffer.from(textEncoder.encode("1234")));
    const res = decodeAndPopBlob(input);
    expect(res.blob.length).toBe(4);
  });
});
