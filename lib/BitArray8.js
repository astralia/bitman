"use strict";

class BitArray8 {

  constructor() {
    this._size = 0;
    this._data = null;
  }

  static allocate(size) {
    return new BitArray8().allocate(size);
  }

  allocate(size) {
    var s = cblk(size);
    //this._size = s*8;
    this._size = size;
    this._data = new Uint8Array(s);
  }

  reallocate(size) {
    var oldData = this._data;
    this.allocate(size);
    for (var i = 0; i < oldData.lenght; i++) {this._data[i] = oldData[i];}
  }

  fill(bit) {return bit ? this.fill1() : this.fill0();}
  fill0() {return this._fillBlocks(0);}
  fill1() {return this._fillBlocks(0xFF);}
  fillByte(pos, val) {
    this._data[pos] = val;
    return this;
  }

  _fillBlocks(v) {
    var bs = this._data;
    for (var i = 0, b = cblk(this._size); i < b; i++) bs[i] = v;
    //for (var i = 0, b = cblk(this._size); i < b-1; i++) bs[i] = v;
    //bs[i+1] = (1 << (off(this._size-1) - 1));
    return this;
  }

  clear() {return this.fill0();}
  clearBit(bit) {
    this._data[blk(bit)] &= ~(1 << (off(bit)));
  }

  clearRg(from, to) {
    var b0 = blk(from), b1 = blk(to-1);
    if (b0 == b1) {
      this._data[b0] &= msk0rg(off(from), off(to-1)+1);
    } else if (b0 < b1) {
      this._data[b0] &= msk0rg(off(from), 8);
      var i = b0 + 1;
      while (i < b1) {
        this._data[i] = 0x0;
        i++;
      }
      this._data[b1] &= msk0rg(0, off(to-1)+1);
    }
  }

  set(bit) {
    this._data[blk(bit)] |= 1 << off(bit);
  }

  setRg(from, to) {
    var b0 = blk(from), b1 = blk(to-1);
    if (b0 == b1) {
      this._data[b0] |= msk1rg(off(from), off(to-1)+1);
    } else if (b0 < b1) {
      this._data[b0] |= msk1rg(off(from), 8);
      var i = b0 + 1;
      while (i < b1) {
        this._data[i] = 0xFF;
        i++;
      }
      this._data[b1] |= msk1rg(0, off(to-1)+1);
    }
  }

  flip(bit) {
    this._data[blk(bit)] ^= 1 << off(bit);
  }

  flipRg(from, to) {
    var b0 = blk(from), b1 = blk(to-1);
    if (b0 == b1) {
      this._data[b0] ^= msk1rg(off(from), off(to-1)+1);
    } else if (b0 < b1) {
      var i = b0 + 1;
      while (i < b1) {
        this._data[i] ^= 0xFF;
        i++;
      }
      this._data[b1] ^= msk1rg(0, off(to-1)+1);
    }
  }

  size() {return this._size;}
  data() {return this._data;}
  byteSize() {return this._data.length;}

  and(xs) {
    if (this.byteSize() < xs.byteSize()) this.reallocate(xs._size);
    for (var i = 0; i < xs.byteSize(); i++) {
      this._data[i] &= xs._data[i];
    }
  }

  or(xs) {
    if (this.byteSize() < xs.byteSize()) this.reallocate(xs._size);
    for (var i = 0; i < xs.byteSize(); i++) {
      this._data[i] |= xs._data[i];
    }
  }

  xor(xs) {
    if (this.byteSize() < xs.byteSize()) this.reallocate(xs._size);
    for (var i = 0; i < xs.bytesSize(); i++) {
      this._data[i] ^= xs._data[i];
    }
  }

  andNot(xs) {
    if (this.byteSize() < xs.byteSize()) this.reallocate(xs._size);
    for (var i = 0; i < xs.byteSize(); i++) {
      this._data[i] &= xs._data[i] ^ this._data[i];
    }
  }

  intersects(xs) {
    var i = 0;
    while (i < this.byteSize()) {
      if (this._data[i] & xs._data[i] != 0) return true;
      else i++;
    }
    return false;
  }

  isEmpty() {
    var i = 0;
    while (i < this.byteSize()) {
      if (this._data[i] != 0) return false;
      else i++;
    }
    return true;
  }


  /*
   * Using the "divide and conquer" strategy mod
   * (Hacker's delight chapter 5)
   * This is also known as "Hamming weight":
   * https://en.wikipedia.org/wiki/Hamming_weight
   */
  cardinality() {
    var i = 0, x = 0, count = 0;
    while (i < this.byteSize()) {
      x = this._data[i];
      x = x - ((x >> 1) & 0x55);
      x = (x & 0x33) + ((x >> 2) & 0x33);
      x = (x + (x >> 4)) & 0x0F;
      count += x;
      i++;
    }
    return count;
  }

  getBit(bit) {
    return (this._data[blk(bit)] >> bit) & 1;
  }

  getRg(from, to) {
    var ba8 = new BitArray8();
    ba8.allocate(to - from);
    var b0 = blk(from), b1 = blk(to-1);
    if (b0 == b1) {
      ba8._data[0]
          = (this._data[b0] & msk1rg(off(from), off(to-1)+1)) >> off(from);
    } else if (b0 < b1) {
      if (off(from) == 0) this._fullBlks(ba8, from, to);
      else this._partedBlks(ba8, from, to);
    }
    return ba8;
  }

  _fullBlks(ba8, from, to) {
    var i = 0, j = blk(from);
    while (j < blk(to-1)) {
      ba8._data[i] = this._data[j];
      i++; j++;
    }
    ba8._data[i] = this._data[j] & msk1rg(0, off(to-1)+1);
  }

  _partedBlks(ba8, from, to) {
    var i = 0, j = blk(from), nfrom = from;
    var ptr = off(nfrom);
    while (i < ba8.byteSize() - 1) {
      ba8._data[i]  = this._data[j] >> ptr;
      ba8._data[i] |= this._data[j+1] << 8 - ptr;
      i++; j++; nfrom += 8; ptr = off(nfrom);
    }
    ba8._data[i] = (this._data[j] & msk1rg(ptr, ptr + (to-nfrom))) >> ptr;
    nfrom += 8 - ptr;
    if (nfrom < to) {
        ba8._data[i] |= (this._data[j+1] & msk1rg(0, off(to-1)+1)) << 8 - ptr;
    }
  }

  nextClearBit(from) {
    var val = this._data[blk(from)] ^ 0xFF;
    var bit = bitlookup[this._nextBitSetInByte(val, off(from))];
    if (bit != -1) return bit;
    var i = cblk(from);
    while (i < this.byteSize()) {
      val = this._data[i] ^ 0xFF;
      bit = bitlookup[this._nextBitSetInByte(val, off(from))];
      if (bit != -1) return bit;
      i++;
    }
    return bit;
  }

  nextSetBit(from) {
    var val = this._data[blk(from)];
    var bit = bitlookup[this._nextBitSetInByte(val, off(from))];
    if (bit != -1) return bit;
    var i = cblk(from);
    while (i < this.byteSize()) {
      val = this._data[i];
      bit = bitlookup[this._nextBitSetInByte(val, off(from))];
      if (bit != -1) return bit;
      i++;
    }
    return bit;
  }

  _nextBitSetInByte(bits, pos) {
    if (pos != 0) bits &= msk1rg(pos, 8);
    return ls1(bits);
  }

  clone() {return new BitArray8().from(this);}
  from(other) {
    this._size = other._size;
    var bs = other._data;
    var ab = bs.buffer.slice(bs.byteOffset, bs.byteOffset + bs.byteLength);
    this._data = new Uint8Array(ab);
    return this;
  }

  equals(xs) {
    if (this._size != xs._size) return false;
    var i = 0;
    while(i < this.byteSize()) {
      if (this._data[i] != xs._data[i]) return false;
      i++;
    }
    return true;
  }

  toString() {
    return "BitArray8["
      + "size: " + this._size
      + "]";
  }

}

const ALL = 0|-1;
function blk(i) {return i >>> 3;}
function cblk(bits) {return blk(bits+7);}
function off(i) {return i & 0x07;}

function msk0(w) {return (1 << w) - 1;}
function msk(i,w) {return msk0(w) << i;}

//function msk0(w) {return ~(1 << w);}
function bigmsk0(w) {return ALL >>> (32-w);}
function msk1rg(i,j) {return (1 << j) - (1 << i);}
function msk0rg(i,j) {return ~(msk1rg(i, j));}
function ls1(w) {return w & (-w);}

const bitlookup = {
  1: 0, 2: 1,  4: 2, 8: 3,
  16: 4, 32: 5, 64: 6, 128: 7,
  0: -1
};

// (1 << (n-m))-1) << m
module.exports = {
  BitArray8
};
