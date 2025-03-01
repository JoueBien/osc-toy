import { floatToBuffer } from "../encoders/floatToBuffer";
import { intToBuffer } from "../encoders/intToBuffer";
import { stringToPaddedBuffer } from "../stringToPaddedBuffer";
import { decodeAndPopBlob, encode } from "./decodeAndPopBlob";
import { decodeAndPopFloat } from "./decodeAndPopFloat";
import { decodeAndPopInit } from "./decodeAndPopInit";
import { decodeAndPopString } from "./decodeAndPopString";

describe("decodeAndPopBlob", () => {
  it("encodes and decodes", () => {
    const input = encode(
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
});
