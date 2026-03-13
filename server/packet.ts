const HEADER = [13, 2, 146, 205, 7, 8];

/**
 * Encode an integer as a MineFun-style varint
 * For single-byte lengths < 128, adds offset 160
 */
function encodeVarint(value: number): number[] {
  const bytes: number[] = [];

  if (value < 128) {
    // small packet: add 160 offset
    bytes.push(160 + value);
  } else {
    // multi-byte varint (standard base-128)
    do {
      let byte = value & 0x7f; // lower 7 bits
      value >>>= 7;
      if (value !== 0) byte |= 0x80; // continuation
      bytes.push(byte);
    } while (value !== 0);
  }

  return bytes;
}

/**
 * Prepare MineFun packet
 * @param payload string to send
 * @returns Uint8Array representing the packet
 */
export const preparePacket = (payload: string): Uint8Array => {
  const encoder = new TextEncoder();
  const payloadBytes = encoder.encode(payload); // convert string to bytes

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
