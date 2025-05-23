// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import KioQR from "./kioqr";
import ReedSolomon from "./reedsolomon";

const kioqr = new KioQR();
const reedSolomon = new ReedSolomon();
const data = "deine mum";

console.log("=== QR CODE GENERATION DEBUG ===");
const bitstream = kioqr.dataToBitstream(data);
const fullBitstream = kioqr.createFullBitstream(data, bitstream);
const paddedBitstream = kioqr.addPadding(fullBitstream);

console.log("[main] Bitstream length:", bitstream.length);
console.log("[main] Full Bitstream length:", fullBitstream.length);
console.log("[main] Padded Bitstream length:", paddedBitstream.length);

const dataBytes = kioqr.paddedBitstreamToByteArray(paddedBitstream);

console.log("[main] DataBytes:", dataBytes);

const ecc = reedSolomon.encode(dataBytes, 7); // 7 is the ECC length

console.log("[main] ECC:", ecc);

const finalBytes = dataBytes.concat(ecc);

console.log("[main] Final Bytes:", finalBytes);

const matrix = kioqr.generateQRMatrix(finalBytes);

console.log("[main] Matrix Size:", matrix.length);
console.log("[main] QR Matrix (0/1):\n" + matrix.map(row => row.map(cell => cell ? "1" : "0").join(" ")).join("\n"));

console.log("------------------------------");
const qrCode = kioqr.renderQR(matrix);

console.log("QR Code (ASCII):\n" + qrCode);