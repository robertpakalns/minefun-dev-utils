// Purpose: convert factual packet from hex to bytes

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: bun run hex <hex string>");
  process.exit(1);
}

const hex = args[0];

const hexToBytes = (hex: string): number[] => {
  if (hex.length % 2 !== 0) {
    throw new Error("Hex string must have an even length");
  }

  const bytes: number[] = [];

  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.slice(i, i + 2), 16));
  }

  return bytes;
};

try {
  const res = hexToBytes(hex);
  console.log(JSON.stringify(res)); // JSON.stringify lets print the whole array
} catch (error: any) {
  console.error("Error:", error.message);
  process.exit(1);
}
