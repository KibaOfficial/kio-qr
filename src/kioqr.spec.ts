// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import KioQR from './kioqr';

describe('KioQR', () => {
  it('should create an instance of KioQR', () => {
    const kioqr = new KioQR();
    expect(kioqr).toBeInstanceOf(KioQR);
    expect(kioqr.name).toBe('KioQR');
    expect(kioqr.version).toBe('1.0.0');
    expect(kioqr.description).toBe('A simple QR code generator.');
    expect(kioqr.author).toBe('KibaOfficial');
    expect(kioqr.license).toBe('MIT');
  });
  it('should convert data to bitstream', () => {
    const kioqr = new KioQR();
    const data = 'Hello';
    const expectedBitstream = "0100100001100101011011000110110001101111";
    const bitstream = kioqr['dataToBitstream'](data);
    expect(bitstream).toEqual(expectedBitstream);
  });
  it('should create a full bitstream with mode and length', () => {
    const kioqr = new KioQR();
    const data = "Hello";
    const bitstream = kioqr.dataToBitstream(data);
    // modeIndicator = "0100", char count = 5 ("00000101"), data
    const expectedFullBitstream = "010000000101" + bitstream;
    const fullBitstream = kioqr.createFullBitstream(bitstream);
    expect(fullBitstream).toEqual(expectedFullBitstream);
  });
});