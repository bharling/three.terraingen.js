(function() {
  var THREE, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  THREE = window.THREE || {};

  THREE.terraingen = THREE.terraingen || {};

  THREE.terraingen.RNGProvider = (function() {
    function RNGProvider(seed) {
      this.random = __bind(this.random, this);
    }

    RNGProvider.prototype.random = function() {};

    return RNGProvider;

  })();

  THREE.terraingen.BasicRandomProvider = (function(_super) {
    __extends(BasicRandomProvider, _super);

    function BasicRandomProvider() {
      this.random = __bind(this.random, this);
      _ref = BasicRandomProvider.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    BasicRandomProvider.prototype.random = function() {
      return Math.random();
    };

    return BasicRandomProvider;

  })(THREE.terraingen.RNGProvider);

  THREE.terraingen.MersenneTwisterProvider = (function(_super) {
    __extends(MersenneTwisterProvider, _super);

    MersenneTwisterProvider.prototype.N = 624;

    MersenneTwisterProvider.prototype.FF = 0xFFFFFFFF;

    function MersenneTwisterProvider(seed) {
      this.random = __bind(this.random, this);
      var i, s, _i, _ref1;
      this.mt = [];
      this.index = 0;
      this.mt[0] = seed != null ? seed : seed = new Date().getTime();
      for (i = _i = 1, _ref1 = this.N; 1 <= _ref1 ? _i < _ref1 : _i > _ref1; i = 1 <= _ref1 ? ++_i : --_i) {
        s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
        this.mt[i] = ((((((s & 0xffff0000) >>> 16) * 0x6C078965) << 16) + (s & 0xffff) * 0x6C078965) + i) >>> 0;
      }
    }

    MersenneTwisterProvider.prototype.random = function() {
      return this.next() * (1.0 / 4294967295.0);
    };

    MersenneTwisterProvider.prototype.next = function() {
      var y;
      if (this.index === 0) {
        this.twist();
      }
      y = this.mt[this.index];
      y = y ^ (y >>> 11);
      y = (y ^ ((y << 7) & 0x9D2C5680)) & this.FF;
      y = (y ^ ((y << 15) & 0xEFC60000)) & this.FF;
      y = y ^ (y >>> 18);
      this.index = (this.index + 1) % this.N;
      return y >>> 0;
    };

    MersenneTwisterProvider.prototype.twist = function() {
      var i, y, _i, _ref1;
      for (i = _i = 0, _ref1 = this.N; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
        y = (this.mt[i] & 0x80000000) | (this.mt[(i + 1) % this.N] & 0x7FFFFFFF);
        this.mt[i] = (this.mt[(i + 397) % this.N] ^ (y >>> 1)) >>> 0;
        if ((y & 1) !== 0) {
          this.mt[i] = (this.mt[i] ^ 0x9908B0DF) >>> 0;
        }
      }
      return null;
    };

    return MersenneTwisterProvider;

  })(THREE.terraingen.RNGProvider);

}).call(this);
