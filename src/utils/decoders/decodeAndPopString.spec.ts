import { stringToPaddedBuffer } from "../stringToPaddedBuffer";
import { decodeAndPopString } from "./decodeAndPopString";

describe("decodeAndPopString", () => {
  it("decodes strings", () => {
    const input = Buffer.concat([
      stringToPaddedBuffer("/argument"),
      stringToPaddedBuffer("ii"),
    ]);
    const res1 = decodeAndPopString(input);
    const res2 = decodeAndPopString(res1.unit8Array);
    // Values match
    expect(res1.str).toBe("/argument");
    expect(res2.str).toBe("ii");
    // Buffer is empty
    expect(res2.unit8Array.length).toBe(0);
  });
});
