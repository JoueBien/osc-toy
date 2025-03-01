import { StringDecoder } from "node:string_decoder";

export const textEncoder = new TextEncoder();

export const textDecoder = new StringDecoder("utf8");

export const intEncoder = {
  encode: function encode(number: number) {
    return new Uint8Array(Uint32Array.of(number).buffer);
  },
};

export const floatEncoder = {
  encode: function encode(number: number) {
    return new Uint8Array(Float32Array.of(number).buffer);
  },
};
