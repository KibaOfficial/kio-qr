// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import KioQR from "./kioqr";
import ReedSolomon from "./reedsolomon";

const kioqr = new KioQR();
const data = "https://kibaofficial.net";
const bitstream = kioqr.dataToBitstream(data);
const fullBitstream = kioqr.createFullBitstream(bitstream);
const paddedBitstream = kioqr.addPadding(fullBitstream);

const dataBytes = kioqr.paddedBitstreamToByteArray(paddedBitstream);

const eccLength = 7; // für Version 1-L
const reedSolomon = new ReedSolomon();
const ecc = reedSolomon.encode(dataBytes, eccLength);

console.log("Data:", data);
console.log("Bitstream:", bitstream);
console.log("Full Bitstream:", fullBitstream);
console.log("Padded Bitstream:", paddedBitstream);
console.log("DataBytes:", dataBytes);
console.log("Error Correction Code:", ecc);