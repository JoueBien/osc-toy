import { StringDecoder } from "node:string_decoder";

export const textEncoder = new TextEncoder();

export const textDecoder = new StringDecoder("utf8");
