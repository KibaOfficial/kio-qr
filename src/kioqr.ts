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
      if (typeof data !== 'string') {
        throw new Error('Input data must be a string');
      }
      const encoder = new TextEncoder();
      return Array.from(encoder.encode(data))
          .map(byte => byte.toString(2).padStart(8, '0'))
          .join('');
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
      const byteLength = (bitStream.length / 8);
      // for Version 1 (1-9): 8 bits length
      const charCountIndicator = byteLength.toString(2).padStart(8, '0');
      // return the full bitstream
      return modeIndicator + charCountIndicator + bitStream;
      // TODO: Add error correction and padding
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
        padded += '0'.repeat(Math.min(4, remaining));
      }

      // 2. Byte alignment (8 bits)
      while (padded.length % 8 !== 0) {
        padded += '0';
      }

      // 3. Pad Bytes (alternated 11101100 = 0xEC, 00010001 = 0x11)
      const padBytes = ['11101100', '00010001'];
      let i = 0;
      while (padded.length < maxBits) {
        padded += padBytes[i % 2];
        i++;
      }

      return padded
    }

    paddedBitstreamToByteArray(paddedBitstream: string): number[] {
      const bytes: number[] = [];
      for (let i = 0; i < paddedBitstream.length; i += 8) {
        bytes.push(parseInt(paddedBitstream.slice(i, i + 8), 2));
      }
      return bytes;
    }

    renderQR(matrix: boolean[][]): string {
      const quietZone = 4;
      const emptyRow = Array(matrix[0].length + quietZone * 2).fill(false);
      const paddedMatrix = [
        ...Array(quietZone).fill(emptyRow),
        ...matrix.map(row => [
          ...Array(quietZone).fill(false),
          ...row,
          ...Array(quietZone).fill(false)
        ]),
        ...Array(quietZone).fill(emptyRow)
      ];
      return paddedMatrix.map(row =>
        row.map((cell: boolean) => (cell ? '██' : '  ')).join('')
      ).join('\n');
    }
   
}

export default KioQR;