// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import KioQR from "./kioqr";
import ReedSolomon from "./reedsolomon";

const kioqr = new KioQR();
const reedSolomon = new ReedSolomon();
const data = "kibaofficial.net";

const bitstream = kioqr.dataToBitstream(data);
const fullBitstream = kioqr.createFullBitstream(bitstream);
const paddedBitstream = kioqr.addPadding(fullBitstream);

const dataBytes = kioqr.paddedBitstreamToByteArray(paddedBitstream);
const ecc = reedSolomon.encode(dataBytes, 7); // 7 is the ECC length
const finalBytes = dataBytes.concat(ecc);

const matrix = kioqr.generateQRMatrix(finalBytes);
const qrCode = kioqr.renderQR(matrix);


console.log("Data:", data);
console.log("Bitstream:", bitstream);
console.log("Full Bitstream:", fullBitstream);
console.log("Padded Bitstream:", paddedBitstream);
console.log("DataBytes:", dataBytes);
console.log("Error Correction Code:", ecc);
console.log("Final Bytes:", finalBytes);
console.log("QR Matrix:", matrix);
console.log("------------------------------");
console.log("QR Code:");
console.log(qrCode);