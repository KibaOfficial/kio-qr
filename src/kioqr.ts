// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

class KioQR {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  qrVersion: "1" | "2" | "3" = "1";
  qrLevel: "L" | "M" | "Q" | "H" = "L";

  constructor() {
    this.name = "KioQR";
    this.version = "1.0.0";
    this.description = "A simple QR code generator.";
    this.author = "KibaOfficial";
    this.license = "MIT";
    this.qrVersion = "1"; // smallest QR code version with 21x21 modules
    this.qrLevel = "L"; // lowest error correction level
  }

  dataToBitstream(data: string): string {
    if (typeof data !== "string") {
      throw new Error("Input data must be a string");
    }
    const encoder = new TextEncoder();
    const encoded = encoder.encode(data);
    if (encoded.length > 19) {
      throw new Error(
        "Input too long for QR version 1-L (max 19 bytes in byte mode)."
      );
    }
    console.log("[dataToBitstream] input:", data);
    console.log("[dataToBitstream] encoded bytes:", Array.from(encoded));
    const bitstream = Array.from(encoded)
      .map((byte) => byte.toString(2).padStart(8, "0"))
      .join("");
    console.log("[dataToBitstream] bitstream:", bitstream);
    return bitstream;
  }

  createFullBitstream(data: string, bitStream: string): string {
    const modeIndicator = "0100";
    const charCount = Buffer.from(data, "utf8").length;
    const charCountIndicator = charCount.toString(2).padStart(8, "0");
    const fullBitstream = modeIndicator + charCountIndicator + bitStream;
    console.log("[createFullBitstream] modeIndicator:", modeIndicator);
    console.log("[createFullBitstream] charCount:", charCount);
    console.log("[createFullBitstream] charCountIndicator:", charCountIndicator);
    console.log("[createFullBitstream] fullBitstream:", fullBitstream);
    return fullBitstream;
  }

  addPadding(bitStream: string): string {
    const maxBits = 152; // Maximum bits for version 1
    let padded = bitStream;
    const remaining = maxBits - padded.length;
    if (remaining > 0) {
      padded += "0".repeat(Math.min(4, remaining));
      console.log("[addPadding] Terminator added:", padded);
    }
    while (padded.length % 8 !== 0) {
      padded += "0";
      if (padded.length % 8 === 0) {
        console.log(
          "[addPadding] Byte aligned (added zeros):",
          padded.substring(padded.length - 8)
        );
      }
    }
    const padBytes = ["11101100", "00010001"];
    let i = 0;
    while (padded.length < maxBits) {
      padded += padBytes[i % 2];
      console.log(
        `[addPadding] Pad byte added (${padBytes[i % 2]}):`,
        padded.substring(padded.length - 8)
      );
      i++;
    }
    console.log("[addPadding] Final padded bitstream:", padded);
    return padded;
  }

  paddedBitstreamToByteArray(paddedBitstream: string): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < paddedBitstream.length; i += 8) {
      const byte = parseInt(paddedBitstream.slice(i, i + 8), 2);
      bytes.push(byte);
      console.log(
        `[paddedBitstreamToByteArray] Byte ${i / 8}: ${paddedBitstream.slice(
          i,
          i + 8
        )} = ${byte}`
      );
    }
    console.log("[paddedBitstreamToByteArray] byte array:", bytes);
    return bytes;
  }

  generateQRMatrix(finalBytes: number[]): boolean[][] {
    const size = 21;
    const matrix: (boolean | null)[][] = Array.from({ length: size }, () =>
      Array(size).fill(null)
    );

    // Finder Patterns
    const placeFinderPattern = (row: number, col: number) => {
      const pattern = [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 0, 1],
        [1, 0, 1, 1, 1, 0, 1],
        [1, 0, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1],
      ];
      for (let r = 0; r < 7; r++)
        for (let c = 0; c < 7; c++)
          matrix[row + r][col + c] = pattern[r][c] === 1;
    };
    placeFinderPattern(0, 0);
    placeFinderPattern(0, size - 7);
    placeFinderPattern(size - 7, 0);

    // Separators
    for (let i = 0; i < 8; i++) {
      matrix[7][i] = false;
      matrix[i][7] = false;
      matrix[7][size - 1 - i] = false;
      matrix[i][size - 8] = false;
      matrix[size - 8][i] = false;
      matrix[size - 1 - i][7] = false;
    }

    // Timing Patterns
    for (let i = 8; i < size - 8; i++) {
      matrix[6][i] = i % 2 === 0;
      matrix[i][6] = i % 2 === 0;
    }

    // Format Info (15 bits, e.g. "111011111000100" for 1-L mask 0)
    const formatInfoBits = [1,1,1,0,1,1,1,1,1,0,0,0,1,0,0];
    // Horizontal (row 8, cols 0–5, 7–8)
    for (let i = 0; i <= 5; i++) matrix[8][i] = !!formatInfoBits[i];
    matrix[8][7] = !!formatInfoBits[6];
    matrix[8][8] = !!formatInfoBits[7]; // Central module, do NOT overwrite later
    matrix[8][8] = !!formatInfoBits[7];
    // Vertical (col 8, rows 0–5, 7–8)
    for (let i = 0; i <= 5; i++) matrix[i][8] = !!formatInfoBits[8 + i];
    matrix[7][8] = !!formatInfoBits[14];

    // Dark module
    matrix[13][8] = true;
    // Central module
    matrix[8][8] = true;

    // Data Placement
    let bitCursor = 0;
    let directionUp = true;
    for (let col = size - 1; col > 0; col -= 2) {
      if (col === 6) col--; // skip timing
      for (let i = 0; i < size; i++) {
        const row = directionUp ? size - 1 - i : i;
        for (let offset = 0; offset < 2; offset++) {
          const x = col - offset;
          const y = row;
          if (matrix[y][x] === null) {
            if (bitCursor < finalBytes.length * 8) {
              const byte = finalBytes[Math.floor(bitCursor / 8)];
              const bit = (byte >> (7 - (bitCursor % 8))) & 1;
              const mask = (x + y) % 2 === 0 ? 1 : 0;
              const maskedBit = (bit ^ mask) === 1;
              // LOGGING:
              if (bitCursor < 32 || bitCursor > finalBytes.length * 8 - 32) {
                console.log(
                  `[generateQRMatrix] Placing bit=${bit} (masked: ${maskedBit ? 1 : 0}) at [${y}][${x}] (col=${col}, row=${row}, offset=${offset}), mask=${mask}, byteIdx=${Math.floor(
                    bitCursor / 8
                  )}, bitInByte=${7 - (bitCursor % 8)}`
                );
              }
              matrix[y][x] = maskedBit;
              bitCursor++;
            } else {
              matrix[y][x] = false;
            }
          }
        }
      }
      directionUp = !directionUp;
    }

    // Fill rest
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (matrix[r][c] === null) matrix[r][c] = false;

    // Optional: print final matrix as 0/1 array
    console.log("[generateQRMatrix] Final Matrix:", matrix.map(row => row.map(cell => cell ? 1 : 0).join(" ")).join("\n"));
    return matrix.map(row => row.map(cell => cell === true));
  }

  renderQR(matrix: boolean[][]): string {
    const quietZone = 4;
    const emptyRow = Array(matrix[0].length + quietZone * 2).fill(false);
    const paddedMatrix = [
      ...Array(quietZone).fill(emptyRow),
      ...matrix.map((row) => [
        ...Array(quietZone).fill(false),
        ...row,
        ...Array(quietZone).fill(false),
      ]),
      ...Array(quietZone).fill(emptyRow),
    ];
    const qrText = paddedMatrix
      .map((row) => row.map((cell: boolean) => (cell ? "  " : "██")).join(""))
      .join("\n");
    console.log("[renderQR] Rendered QR:\n" + qrText);
    return qrText;
  }
}

export default KioQR;