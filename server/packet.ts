// Fixed header that instructs the server to execute a script
// These bytes are always present at the beginning of every packet
const HEADER = [13, 2, 146, 205, 7, 8];

/**
 * Encodes a number using the protocol's variable-length integer format.
 *
 * Encoding rules:
 * * 0–32   → one byte: 160 + `value`
 * * 33–255 → two bytes:  [217, `value`]
 * * 256+   → three bytes: [218, `highByte`, `lowByte`]
 *
 * This is used to encode the payload length before the actual payload bytes.
 */
const encodeVarint = (value: number): number[] => {
  if (value < 32) {
    return [160 + value];
  } else if (value <= 255) {
    return [217, value];
  } else {
    const high = (value >> 8) & 0xff;
    const low = value & 0xff;
    return [218, high, low];
  }
};

// MineFun.io does not send raw control characters in the script payload.
// Instead, it serializes them as escaped text sequences exactly like
// they appear in the command block (e.g., "\n", "\r", "\t", "\0").
const escapePayload = (str: string): string =>
  str
    .replace(/\\/g, "\\\\")
    .replace(/\0/g, "\\0")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");

/**
 * Builds a packet ready to be sent to the server.
 *
 * Packet structure:
 * `[HEADER][LENGTH][PAYLOAD]`
 *
 * * `HEADER` — fixed command bytes telling the server to execute a script
 * * `LENGTH` — payload length encoded using the protocol's varint format
 * * `PAYLOAD` — UTF-8 encoded script text
 */
export const preparePacket = (payload: string): Uint8Array => {
  const encoder = new TextEncoder();

  const escaped = escapePayload(payload);
  const payloadBytes = encoder.encode(escaped);

  const lengthBytes = encodeVarint(payloadBytes.length);

  // Combine HEADER + LENGTH + PAYLOAD
  const packet = new Uint8Array(
    HEADER.length + lengthBytes.length + payloadBytes.length,
  );

  packet.set(HEADER, 0);
  packet.set(lengthBytes, HEADER.length);
  packet.set(payloadBytes, HEADER.length + lengthBytes.length);

  return packet;
};
