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
    this._size = s*8;
    this._data = new Uint8Array(s);
  }

  fill(bit) {return bit ? this.fill1() : this.fill0();}
  fill0() {return this._fillBlocks(0);}
  fill1() {return this._fillBlocks(0xFF);}

  _fillBlocks(v) {
    var bs = this._data;
    for (var i = 0, b = cblk(this._size); i < b; i++) bs[i] = v;
    return this;
  }

  clear() {return this.fill0();}
  clear(bit) {
    this._data[blk(bit)] &= msk0(off(bit));
  }

  clearMulti(from, to) {
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

  setMulti(from, to) {
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

  size() {return this._size;}
  data() {return this._data;}

  clone() {return new BitArray8().from(this);}
  from(other) {
    this._size = other._size;
    var bs = other._data;
    var ab = bs.buffer.slice(bs.byteOffset, bs.byteOffset + bs.byteLength);
    this._data = new Uint8Array(ab);
    return this;
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
function pow2(i) {return 1 << i;}

//function msk0(w) {return pow2(2) - 1;}
//function msk(i,w) {return msk0(0) << i;}

function msk0(i) {return 0xFF - (1 << i);}
function bigmsk0(w) {return ALL >>> (32-w);}
function msk1rg(i,j) {return pow2(j)-pow2(i);}
function msk0rg(i,j) {return 0xFF - (msk1rg(i, j));}

module.exports = {
  BitArray8
};
