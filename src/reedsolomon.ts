// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
class ReedSolomon {
  static generatorPolynomials: { [eccLength: number]: number[] } = {}

  private static gfExp: number[] = new Array(512);
  private static gfLog: number[] = new Array(256);

  constructor() {
    if (ReedSolomon.gfLog[1] === undefined) {
      this.initGaloisTables();
    }
  }

  private initGaloisTables() {
    let x = 1;
    const primitive = 0x11d;
    for (let i = 0; i < 256; i++) {
      ReedSolomon.gfExp[i] = x;
      ReedSolomon.gfLog[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= primitive;
    }
    for (let i = 256; i < 512; i++) {
      ReedSolomon.gfExp[i] = ReedSolomon.gfExp[i - 255];
    }
  }

  // Galois-Feld Multiplikation
  private gfMultiply(x: number, y: number): number {
    if (x === 0 || y === 0) return 0;
    return ReedSolomon.gfExp[(ReedSolomon.gfLog[x] + ReedSolomon.gfLog[y]) % 255];
  }

  private generateGeneratorPolynomial(eccLength: number): number[] {
    if (ReedSolomon.generatorPolynomials[eccLength]) {
      return ReedSolomon.generatorPolynomials[eccLength];
    }
    let gen = [1];
    for (let i = 0; i < eccLength; i++) {
      gen = this.polynomialMultiply(gen, [1, ReedSolomon.gfExp[i]]);
    }
    ReedSolomon.generatorPolynomials[eccLength] = gen;
    return gen;
  }

  private polynomialMultiply(p1: number[], p2: number[]): number[] {
    const result = new Array(p1.length + p2.length - 1).fill(0);
    for (let i = 0; i < p1.length; i++) {
      for (let j = 0; j < p2.length; j++) {
        result[i + j] ^= this.gfMultiply(p1[i], p2[j]);
      }
    }
    return result;
  }

  encode(data: number[], eccLength: number): number[] {
    const gen = this.generateGeneratorPolynomial(eccLength);
    const ecc = new Array(eccLength).fill(0);
    for (let i = 0; i < data.length; i++) {
      const factor = data[i] ^ ecc[0];
      ecc.shift();
      ecc.push(0);
      for (let j = 0; j < gen.length - 1; j++) {
        ecc[j] ^= this.gfMultiply(gen[j + 1], factor);
      }
    }
    return ecc;
  }
}

export default ReedSolomon;