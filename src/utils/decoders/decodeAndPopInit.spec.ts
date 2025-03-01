import { intEncoder } from "../encoders/baseEncoders";
import { intToBuffer } from "../encoders/intToBuffer";
import { decodeAndPopInit } from "./decodeAndPopInit";

describe("decodeAndPopInit", () => {
  it("handles 100", () => {
    const input = intToBuffer(100);
    const res = decodeAndPopInit(input);
    expect(res.number).toBe(100);
  });

  it("handles 1234567890", () => {
    const input = intToBuffer(1234567890);
    const res = decodeAndPopInit(input);
    expect(res.number).toBe(1234567890);
  });
});
