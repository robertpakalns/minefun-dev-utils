import { describe, it, expect } from "bun:test";
import { preparePacket } from "./packet";

interface Tests {
  // A string which a user pastes into the MineFun.io command block,
  // i.e., JavaScript script with the game API
  payload: string;
  // An array of bytes which the client sends to the server when executing the payload
  // All bytes are gathered from the MineFun.io client side when sending to the server
  expected: number[];
}

// Fills an array with the `num` amount of ";"
const fill = (num: number): number[] => new Array(num).fill(59);

const PAYLOAD_LENGTH_TESTS: Tests[] = [
  {
    payload: ";".repeat(1), // 1 ";"
    expected: [13, 2, 146, 205, 7, 8, 161, 59],
  },
  {
    payload: ";".repeat(32), // 32 ";"
    expected: [13, 2, 146, 205, 7, 8, 217, 32, ...fill(32)],
  },
  {
    payload: ";".repeat(34), // 34 ";"
    expected: [13, 2, 146, 205, 7, 8, 217, 34, ...fill(34)],
  },
  {
    payload: ";".repeat(35), // 35 ";"
    expected: [13, 2, 146, 205, 7, 8, 217, 35, ...fill(35)],
  },
  {
    payload: ";".repeat(40), // 40 ";"
    expected: [13, 2, 146, 205, 7, 8, 217, 40, ...fill(40)],
  },
  {
    payload: ";".repeat(50), // 50 ";"
    expected: [13, 2, 146, 205, 7, 8, 217, 50, ...fill(50)],
  },
  {
    payload: ";".repeat(68), // 68 ";"
    expected: [13, 2, 146, 205, 7, 8, 217, 68, ...fill(68)],
  },
  {
    payload: ";".repeat(255), // 255 ";"
    expected: [13, 2, 146, 205, 7, 8, 217, 255, ...fill(255)],
  },
  {
    payload: ";".repeat(256), // 256 ";"
    expected: [13, 2, 146, 205, 7, 8, 218, 1, 0, ...fill(256)],
  },
  {
    payload: ";".repeat(260), // 260 ";"
    expected: [13, 2, 146, 205, 7, 8, 218, 1, 4, ...fill(260)],
  },
  {
    payload: ";".repeat(999), // 999 ";"
    expected: [13, 2, 146, 205, 7, 8, 218, 3, 231, ...fill(999)],
  },
  {
    payload: ";".repeat(2048), // 2048 ";"
    expected: [13, 2, 146, 205, 7, 8, 218, 8, 0, ...fill(2048)],
  },
  {
    payload: ";".repeat(10000), // 10000 ";"
    expected: [13, 2, 146, 205, 7, 8, 218, 39, 16, ...fill(10000)],
  },
  {
    // Approximate length of payload which causes the game server to crash
    payload: ";".repeat(16375), // 16375 ";"
    expected: [13, 2, 146, 205, 7, 8, 218, 63, 247, ...fill(16375)],
  },
];

const PAYLOAD_CONTENT_TESTS: Tests[] = [
  {
    payload: "", // Empty string
    expected: [13, 2, 146, 205, 7, 8, 160],
  },
  {
    payload: "api.log(23)",
    expected: [
      13, 2, 146, 205, 7, 8, 171, 97, 112, 105, 46, 108, 111, 103, 40, 50, 51,
      41,
    ],
  },
  {
    payload: 'api.log("Hello, world!")',
    expected: [
      13, 2, 146, 205, 7, 8, 184, 97, 112, 105, 46, 108, 111, 103, 40, 34, 72,
      101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100, 33, 34, 41,
    ],
  },
  {
    payload:
      'api.log("Lorem ipsum dolor sit amet, consectetuer adipiscing elit.")',
    expected: [
      13, 2, 146, 205, 7, 8, 217, 68, 97, 112, 105, 46, 108, 111, 103, 40, 34,
      76, 111, 114, 101, 109, 32, 105, 112, 115, 117, 109, 32, 100, 111, 108,
      111, 114, 32, 115, 105, 116, 32, 97, 109, 101, 116, 44, 32, 99, 111, 110,
      115, 101, 99, 116, 101, 116, 117, 101, 114, 32, 97, 100, 105, 112, 105,
      115, 99, 105, 110, 103, 32, 101, 108, 105, 116, 46, 34, 41,
    ],
  },
  {
    // Very long arbitrary text
    payload:
      'api.log("Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.")',
    expected: [
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
    ],
  },
  {
    payload: 'api.chat.sendMessage(1, "hello")',
    expected: [
      13, 2, 146, 205, 7, 8, 217, 32, 97, 112, 105, 46, 99, 104, 97, 116, 46,
      115, 101, 110, 100, 77, 101, 115, 115, 97, 103, 101, 40, 49, 44, 32, 34,
      104, 101, 108, 108, 111, 34, 41,
    ],
  },
  {
    payload: 'api.chat.sendMessage(1, "")',
    expected: [
      13, 2, 146, 205, 7, 8, 187, 97, 112, 105, 46, 99, 104, 97, 116, 46, 115,
      101, 110, 100, 77, 101, 115, 115, 97, 103, 101, 40, 49, 44, 32, 34, 34,
      41,
    ],
  },
  {
    payload: 'api.log("é")',
    expected: [
      13, 2, 146, 205, 7, 8, 173, 97, 112, 105, 46, 108, 111, 103, 40, 34, 195,
      169, 34, 41,
    ],
  },
  {
    payload: 'api.log("你好")',
    expected: [
      13, 2, 146, 205, 7, 8, 177, 97, 112, 105, 46, 108, 111, 103, 40, 34, 228,
      189, 160, 229, 165, 189, 34, 41,
    ],
  },
  {
    payload: 'api.log("🙂")',
    expected: [
      13, 2, 146, 205, 7, 8, 175, 97, 112, 105, 46, 108, 111, 103, 40, 34, 240,
      159, 153, 130, 34, 41,
    ],
  },
  {
    // Send "\X" as two bytes
    payload: 'api.log("a\nb\n\rc\td\0e")',
    expected: [
      13, 2, 146, 205, 7, 8, 186, 97, 112, 105, 46, 108, 111, 103, 40, 34, 97,
      92, 110, 98, 92, 110, 92, 114, 99, 92, 116, 100, 92, 48, 101, 34, 41,
    ],
  },
];

const TESTS: Tests[] = [...PAYLOAD_LENGTH_TESTS, ...PAYLOAD_CONTENT_TESTS];

// 15 characters max
const preview = (str: string) =>
  str.length > 15 ? str.slice(0, 15) + "..." : str;

describe("preparePacket", () => {
  TESTS.forEach(({ payload, expected }) => {
    it(`length ${payload.length} — "${preview(payload)}"`, () => {
      const res = preparePacket(payload);
      expect(res).toEqual(new Uint8Array(expected));
    });
  });
});
