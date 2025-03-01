import { intEncoder } from "../encoders/baseEncoders";
import { decodeAndPopInit } from "./decodeAndPopInit";

describe("decodeAndPopInit", () => {
  it("handles 100", () => {
    const input = Buffer.from(intEncoder.encode(100)).reverse();
    const res = decodeAndPopInit(input);
    expect(res.number).toBe(100);
  });

  it("handles 1234567890", () => {
    const input = Buffer.from(intEncoder.encode(1234567890)).reverse();
    const res = decodeAndPopInit(input);
    expect(res.number).toBe(1234567890);
  });
});
