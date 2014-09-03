(function() {
  var THREE,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  THREE = window.THREE || {};

  THREE.terraingen = THREE.terraingen || {};

  THREE.terraingen.RNGProvider = (function() {
    function RNGProvider() {
      this.init();
    }

    RNGProvider.prototype.init = function(seed) {
      this.seed = seed;
    };

    RNGProvider.prototype.random = function() {};

    return RNGProvider;

  })();

  THREE.terraingen.BasicRandomProvider = (function(_super) {
    __extends(BasicRandomProvider, _super);

    function BasicRandomProvider() {
      return BasicRandomProvider.__super__.constructor.apply(this, arguments);
    }

    BasicRandomProvider.prototype.random = function() {
      return Math.random();
    };

    return BasicRandomProvider;

  })(THREE.terraingen.RNGProvider);

  THREE.terraingen.MersenneTwisterProvider = (function(_super) {
    __extends(MersenneTwisterProvider, _super);

    function MersenneTwisterProvider() {
      return MersenneTwisterProvider.__super__.constructor.apply(this, arguments);
    }

    MersenneTwisterProvider.prototype.init = function(seed) {
      this.seed = seed;
      if (this.seed == null) {
        this.seed = new Date().getTime();
      }
      this.N = 624;
      this.M = 39;
      this.MATRIX_A = 0x9908b0df;
      this.UPPER_MASK = 0x80000000;
      this.LOWER_MASK = 0x7fffffff;
      this.mt = new Array(this.N);
      this.mti = this.N + 1;
      return this.init_genrand(this.seed);
    };

    MersenneTwisterProvider.prototype.random = function() {
      return this.genrand_real1();
    };

    MersenneTwisterProvider.prototype.init_genrand = function(s) {
      var _results;
      this.mt[0] = s >>> 0;
      this.mti = 1;
      _results = [];
      while (this.mti <= this.N) {
        s = this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30);
        this.mt[this.mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253) + this.mti;
        this.mt[this.mti] >>>= 0;
        _results.push(this.mti++);
      }
      return _results;
    };

    MersenneTwisterProvider.prototype.genrand_int31 = function() {
      return this.genrand_int32() >>> 1;
    };

    MersenneTwisterProvider.prototype.genrand_real1 = function() {
      return this.genrand_int32() * (1.0 / 4294967295.0);
    };

    MersenneTwisterProvider.prototype.genrand_int32 = function() {
      var kk, mag01, y;
      mag01 = new Array(0x0, this.MATRIX_A);
      if (this.mti >= this.N) {
        kk = 0;
        if (this.mti === this.N + 1) {
          this.init_genrand(5489);
        }
        while (kk < this.N - this.M) {
          y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
          this.mt[kk] = this.mt[kk + this.M] ^ (y >>> 1) ^ mag01[y & 0x1];
          kk++;
        }
        while (kk < this.N - 1) {
          y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
          this.mt[kk] = this.mt[kk + (this.M - this.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
          kk++;
        }
        y = (this.mt[this.N - 1] & this.UPPER_MASK) | (this.mt[0] & this.LOWER_MASK);
        this.mt[this.N - 1] = this.mt[this.M - 1] ^ (y >>> 1) ^ mag01[y & 0x1];
        this.mti = 0;
      }
      y = this.mt[this.mti++];
      y ^= y >>> 11;
      y ^= (y << 7) & 0x9d2c5680;
      y ^= (y << 15) & 0xefc60000;
      y ^= y >>> 18;
      return y >>> 0;
    };

    return MersenneTwisterProvider;

  })(THREE.terraingen.RNGProvider);

}).call(this);
