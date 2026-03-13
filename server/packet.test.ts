import { describe, it, expect } from "bun:test";
import { preparePacket } from "./packet";

interface Tests {
  payload: string;
  expected: Uint8Array<ArrayBuffer>;
}

const fill = (num: number): Uint8Array<ArrayBuffer> => {
  return new Uint8Array(num).fill(59);
};

const TESTS: Tests[] = [
  // Empty string
  {
    payload: "",
    expected: new Uint8Array([13, 2, 146, 205, 7, 8, 160]),
  },
  {
    payload: "api.log(23)",
    expected: new Uint8Array([
      13, 2, 146, 205, 7, 8, 171, 97, 112, 105, 46, 108, 111, 103, 40, 50, 51,
      41,
    ]),
  },
  {
    payload: 'api.log("Hello, world!")',
    expected: new Uint8Array([
      13, 2, 146, 205, 7, 8, 184, 97, 112, 105, 46, 108, 111, 103, 40, 34, 72,
      101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100, 33, 34, 41,
    ]),
  },
  {
    payload:
      'api.log("Lorem ipsum dolor sit amet, consectetuer adipiscing elit.")',
    expected: new Uint8Array([
      13, 2, 146, 205, 7, 8, 217, 68, 97, 112, 105, 46, 108, 111, 103, 40, 34,
      76, 111, 114, 101, 109, 32, 105, 112, 115, 117, 109, 32, 100, 111, 108,
      111, 114, 32, 115, 105, 116, 32, 97, 109, 101, 116, 44, 32, 99, 111, 110,
      115, 101, 99, 116, 101, 116, 117, 101, 114, 32, 97, 100, 105, 112, 105,
      115, 99, 105, 110, 103, 32, 101, 108, 105, 116, 46, 34, 41,
    ]),
  },
  {
    payload: ";".repeat(34), // 34 ";"
    expected: new Uint8Array([13, 2, 146, 205, 7, 8, 194, ...fill(34)]),
  },
  {
    payload: ";".repeat(35), // 35 ";"
    expected: new Uint8Array([13, 2, 146, 205, 7, 8, 217, 35, ...fill(35)]),
  },
  {
    payload: ";".repeat(40), // 40 ";"
    expected: new Uint8Array([13, 2, 146, 205, 7, 8, 217, 40, ...fill(40)]),
  },
  {
    payload: ";".repeat(50), // 50 ";"
    expected: new Uint8Array([13, 2, 146, 205, 7, 8, 217, 50, ...fill(50)]),
  },
  {
    payload: ";".repeat(68), // 68 ";"
    expected: new Uint8Array([13, 2, 146, 205, 7, 8, 217, 68, ...fill(68)]),
  },
  // Very long text
  {
    payload:
      'api.log("Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.")',
    expected: new Uint8Array([
      13, 2, 146, 205, 7, 8, 217, 202, 97, 112, 105, 46, 108, 111, 103, 40, 34,
      76, 111, 114, 101, 109, 32, 105, 112, 115, 117, 109, 32, 100, 111, 108,
      111, 114, 32, 115, 105, 116, 32, 97, 109, 101, 116, 44, 32, 99, 111, 110,
      115, 101, 99, 116, 101, 116, 117, 101, 114, 32, 97, 100, 105, 112, 105,
      115, 99, 105, 110, 103, 32, 101, 108, 105, 116, 46, 32, 65, 101, 110, 101,
      97, 110, 32, 99, 111, 109, 109, 111, 100, 111, 32, 108, 105, 103, 117,
      108, 97, 32, 101, 103, 101, 116, 32, 100, 111, 108, 111, 114, 46, 32, 65,
      101, 110, 101, 97, 110, 32, 109, 97, 115, 115, 97, 46, 32, 67, 117, 109,
      32, 115, 111, 99, 105, 105, 115, 32, 110, 97, 116, 111, 113, 117, 101, 32,
      112, 101, 110, 97, 116, 105, 98, 117, 115, 32, 101, 116, 32, 109, 97, 103,
      110, 105, 115, 32, 100, 105, 115, 32, 112, 97, 114, 116, 117, 114, 105,
      101, 110, 116, 32, 109, 111, 110, 116, 101, 115, 44, 32, 110, 97, 115, 99,
      101, 116, 117, 114, 32, 114, 105, 100, 105, 99, 117, 108, 117, 115, 32,
      109, 117, 115, 46, 34, 41,
    ]),
  },
  {
    payload: ";".repeat(255), // 255 ";"
    expected: new Uint8Array([13, 2, 146, 205, 7, 8, 217, 255, ...fill(255)]),
  },
  {
    payload: ";".repeat(256), // 256 ";"
    expected: new Uint8Array([13, 2, 146, 205, 7, 8, 218, 1, 0, ...fill(256)]),
  },
  {
    payload: ";".repeat(260), // 260 ";"
    expected: new Uint8Array([13, 2, 146, 205, 7, 8, 218, 1, 4, ...fill(260)]),
  },
];

// 15 characters max
const preview = (str: string) =>
  str.length > 15 ? str.slice(0, 15) + "..." : str;

describe("preparePacket", () => {
  TESTS.forEach(({ payload, expected }) => {
    it(`length ${payload.length} — ${preview(payload)}`, () => {
      const res = preparePacket(payload);
      expect(res).toEqual(expected);
    });
  });
});
