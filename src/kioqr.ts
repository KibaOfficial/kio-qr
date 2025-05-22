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

  /**
   * KioQR constructor
   * @param {string} name - The name of the QR code generator.
   * @param {string} version - The version of the QR code generator.
   * @param {string} description - The description of the QR code generator.
   * @param {string} author - The author of the QR code generator.
   * @param {string} license - The license of the QR code generator.
   */
  constructor() {
    this.name = "KioQR";
    this.version = "1.0.0";
    this.description = "A simple QR code generator.";
    this.author = "KibaOfficial";
    this.license = "MIT";

    this.qrVersion = "1"; // smallest QR code version with 21x21 modules
    this.qrLevel = "L"; // lowest error correction level
  }

  /**
   * Converts data to a bitstream.
   * @param {string} data - The input data to convert.
   * @returns {string} - The bitstream representation of the data.
   * @example
   * const kioqr = new KioQR();
   * const data = "Hello, KioQR!";
   * const bitstream = kioqr.dataToBitstream(data);
   * console.log(bitstream); // Outputs the bitstream representation of the data
   */
  dataToBitstream(data: string): string {
    if (typeof data !== "string") {
      throw new Error("Input data must be a string");
    }
    const encoder = new TextEncoder();
    return Array.from(encoder.encode(data))
      .map((byte) => byte.toString(2).padStart(8, "0"))
      .join("");
  }

  /**
   * Creates a full bitstream for the QR code.
   * @param bitStream - The bitstream to be converted.
   * @returns - The full bitstream for the QR code.
   * @example
   * const kioqr = new KioQR();
   * const data = "Hello, KioQR!";
   * const bitstream = kioqr.dataToBitstream(data);
   * const fullBitstream = kioqr.createFullBitstream(bitstream);
   * console.log(fullBitstream); // Outputs the full bitstream for the QR code
   */
  createFullBitstream(bitStream: string): string {
    // 1. Moduse Indicator (Byte-Mode)
    const modeIndicator = "0100"; // Byte mode indicator
    // 2. Character Count Indicator
    const byteLength = bitStream.length / 8;
    // for Version 1 (1-9): 8 bits length
    const charCountIndicator = byteLength.toString(2).padStart(8, "0");
    // return the full bitstream
    return modeIndicator + charCountIndicator + bitStream;
  }

  /**
   * Adds padding to the bitstream
   * to ensure it meets the QR code requirements.
   * @param bitStream - The bitstream to be padded.
   * @returns - The padded bitstream.
   * @example
   * const kioqr = new KioQR();
   * const data = "Hello, KioQR!";
   * const bitstream = kioqr.dataToBitstream(data);
   * const fullBitstream = kioqr.createFullBitstream(bitstream);
   * const paddedBitstream = kioqr.addPadding(fullBitstream);
   * console.log(paddedBitstream); // Outputs the padded bitstream
   */
  addPadding(bitStream: string): string {
    const maxBits = 152; // Maximum bits for version 1
    let padded = bitStream;

    // 1. Terminator (4 bits)
    const remaining = maxBits - padded.length;
    if (remaining > 0) {
      padded += "0".repeat(Math.min(4, remaining));
    }

    // 2. Byte alignment (8 bits)
    while (padded.length % 8 !== 0) {
      padded += "0";
    }

    // 3. Pad Bytes (alternated 11101100 = 0xEC, 00010001 = 0x11)
    const padBytes = ["11101100", "00010001"];
    let i = 0;
    while (padded.length < maxBits) {
      padded += padBytes[i % 2];
      i++;
    }

    return padded;
  }

  paddedBitstreamToByteArray(paddedBitstream: string): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < paddedBitstream.length; i += 8) {
      bytes.push(parseInt(paddedBitstream.slice(i, i + 8), 2));
    }
    return bytes;
  }

  generateQRMatrix(finalBytes: number[]): boolean[][] {
  const size = 21;
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null)
  );

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
    for (let r = 0; r < pattern.length; r++) {
      for (let c = 0; c < pattern[r].length; c++) {
        matrix[row + r][col + c] = pattern[r][c] === 1;
      }
    }
  };

  placeFinderPattern(0, 0);
  placeFinderPattern(0, size - 7);
  placeFinderPattern(size - 7, 0);

  // Separator patterns (weißer Rand um Finder-Pattern)
  for (let i = 0; i < 8; i++) {
    matrix[7][i] = false;
    matrix[i][7] = false;

    matrix[7][size - 1 - i] = false;
    matrix[i][size - 8] = false;

    matrix[size - 8][i] = false;
    matrix[size - 1 - i][7] = false;
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Format info für Version 1-L, Maske 0 (BCH: 111011111000100)
  const formatInfoBits = [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0];

  // Format info setzen (horizontal & vertikal, inkl. Spiegelung)
  matrix[8][0] = !!formatInfoBits[0];
  matrix[8][1] = !!formatInfoBits[1];
  matrix[8][2] = !!formatInfoBits[2];
  matrix[8][3] = !!formatInfoBits[3];
  matrix[8][4] = !!formatInfoBits[4];
  matrix[8][5] = !!formatInfoBits[5];
  matrix[8][7] = !!formatInfoBits[6];
  matrix[8][8] = !!formatInfoBits[7];

  matrix[0][8] = !!formatInfoBits[8];
  matrix[1][8] = !!formatInfoBits[9];
  matrix[2][8] = !!formatInfoBits[10];
  matrix[3][8] = !!formatInfoBits[11];
  matrix[4][8] = !!formatInfoBits[12];
  matrix[5][8] = !!formatInfoBits[13];
  matrix[7][8] = !!formatInfoBits[14];

  matrix[8][size - 1] = !!formatInfoBits[0];
  matrix[8][size - 2] = !!formatInfoBits[1];
  matrix[8][size - 3] = !!formatInfoBits[2];
  matrix[8][size - 4] = !!formatInfoBits[3];
  matrix[8][size - 5] = !!formatInfoBits[4];
  matrix[8][size - 6] = !!formatInfoBits[5];
  matrix[8][size - 7] = !!formatInfoBits[6];

  matrix[size - 1][8] = !!formatInfoBits[8];
  matrix[size - 2][8] = !!formatInfoBits[9];
  matrix[size - 3][8] = !!formatInfoBits[10];
  matrix[size - 4][8] = !!formatInfoBits[11];
  matrix[size - 5][8] = !!formatInfoBits[12];
  matrix[size - 6][8] = !!formatInfoBits[13];
  matrix[size - 7][8] = !!formatInfoBits[14];

  // Data bits zigzag + MASKING (Maske 0: (row+col)%2==0 --> invert!)
  let bitCursor = 0;
  let goingUp = true;
  for (let col = size - 1; col >= 0; col -= 2) {
    if (col === 6) col--;
    if (goingUp) {
      for (let row = size - 1; row >= 0; row--) {
        for (let cOffset = 0; cOffset < 2; cOffset++) {
          const x = col - cOffset;
          const y = row;
          if (x >= 0 && y >= 0 && matrix[y][x] === null) {
            if (bitCursor < finalBytes.length * 8) {
              const byte = finalBytes[Math.floor(bitCursor / 8)];
              const bit = (byte >> (7 - (bitCursor % 8))) & 1;
              // MASKING!
              const mask = (y + x) % 2 === 0 ? 1 : 0;
              const maskedBit = (bit ^ mask) === 1;
              matrix[y][x] = maskedBit;
              bitCursor++;
            } else {
              matrix[y][x] = false;
            }
          }
        }
      }
    } else {
      for (let row = 0; row < size; row++) {
        for (let cOffset = 0; cOffset < 2; cOffset++) {
          const x = col - cOffset;
          const y = row;
          if (x >= 0 && y >= 0 && matrix[y][x] === null) {
            if (bitCursor < finalBytes.length * 8) {
              const byte = finalBytes[Math.floor(bitCursor / 8)];
              const bit = (byte >> (7 - (bitCursor % 8))) & 1;
              // MASKING!
              const mask = (y + x) % 2 === 0 ? 1 : 0;
              const maskedBit = (bit ^ mask) === 1;
              matrix[y][x] = maskedBit;
              bitCursor++;
            } else {
              matrix[y][x] = false;
            }
          }
        }
      }
    }
    goingUp = !goingUp;
  }

  // Jetzt die Pflicht-Overwrites!
  matrix[13][8] = true; // dark module, immer schwarz
  matrix[8][8] = true;  // Kreuzmodul immer schwarz

  // Fill empty cells
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === null) matrix[r][c] = false;
    }
  }

  return matrix.map((row) => row.map((cell) => cell === true));
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
    return paddedMatrix
      .map((row) => row.map((cell: boolean) => (cell ? "██" : "  ")).join(""))
      .join("\n");
  }
}

export default KioQR;
