import { stringToPaddedBuffer } from "./stringToPaddedBuffer";

describe("stringToPaddedBuffer pads buffer to blocks of 4", () => {
  it("4 char has 0000 padded at end", () => {
    const res = stringToPaddedBuffer("1234");
    expect(res.toJSON().data).toEqual([49, 50, 51, 52, 0, 0, 0, 0]);
  });

  it("3 char has 0 padded at end", () => {
    const res = stringToPaddedBuffer("123");
    expect(res.toJSON().data).toEqual([49, 50, 51, 0]);
  });

  it("2 char has 00 padded at end", () => {
    const res = stringToPaddedBuffer("12");
    expect(res.toJSON().data).toEqual([49, 50, 0, 0]);
  });

  it("1 char has 000 padded at end", () => {
    const res = stringToPaddedBuffer("1");
    expect(res.toJSON().data).toEqual([49, 0, 0, 0]);
  });

  it("empty char has 0000 padded at end", () => {
    const res = stringToPaddedBuffer("");
    expect(res.toJSON().data).toEqual([0, 0, 0, 0]);
  });
});
