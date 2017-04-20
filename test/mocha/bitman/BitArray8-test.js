"use strict";

var BitArray8 = require('bitman/BitArray8').BitArray8;

const times = 100;

describe('Bitman', function() {
  describe('BitArray8:', function() {
    it("count the number of ones", function() {
      for (var t = 0; t < times; t++) {
        var ba8 = randomize();
        var r1 = ba8.cardinality(), r2 = 0;
        for (var i = 0; i < ba8.byteSize(); i++) {
          var x = ba8.data()[i];
          while (x != 0) {
            r2++;
            x &= (x-1);
          }
        }
        r1.should.equal(r2);
      }
    });

    it("clear all the bits", function() {
      for (var t = 0; t < times; t++) {
        var ba8 = randomize();
        (ba8.clear().isEmpty()).should.equal(true);
      }
    });

    it("clear a specified bit", function() {
      for (var t = 0; t < times; t++) {
        var ba8 = randomize();
        var i = Math.floor(Math.random() * ba8.size());
        ba8.clearBit(i);
        (ba8.getBit(i)).should.equal(0);
      }
    });

    it("clear specified range of bits", function() {
      for (var t = 0; t < times; t++) {
        var ba8 = randomize();
        var x = Math.floor(Math.random() * ba8.size());
        var y = x + Math.floor(Math.random() * (ba8.size() - x)) + 1;
        ba8.clearRg(x, y);
        var r = ba8.getRg(x, y);
        (r.isEmpty()).should.equal(true);
      }
    });

    it("set a specified bit", function() {
      for (var t = 0; t < times; t++) {
        var ba8 = randomize();
        var i = Math.floor(Math.random() * ba8.size());
        ba8.set(i);
        (ba8.getBit(i)).should.equal(1);
      }
    });

    it("set a specified range of bits", function() {
      var ba8 = randomize();
      var x = Math.floor(Math.random() * ba8.size());
      var y = x + Math.floor(Math.random() * (ba8.size() - x)) + 1;
      ba8.set(x, y);
      var ba8resized = ba8.getRg(x, y);
      var ba8ones = new BitArray8().allocate(ba8resized.size()).fill1();
      ba8ones.and(ba8resized);
      (ba8resized.equals(ba8ones)).should.equal(true);
    });

  });
})

function randomize() {
  var nbytes = Math.floor(Math.random() * 8 + 1);
  var xs = new BitArray8().allocate(nbytes*8);
  for (var i = 0; i < nbytes; i++) {
    xs.fillByte(i, Math.floor(Math.random() * 255));
  }
  return xs;
}
