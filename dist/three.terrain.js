(function() {
  var NE, NW, QuadTreeNode, SE, SW, THREE, abs, calculateCameraRect, cos, exports, fade, floor, getCameraTarget, grad, lerp, log, max, min, pow, sin, sqrt,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  exports = typeof exports !== 'undefined' ? exports : window;

  THREE = typeof exports.THREE !== 'undefined' ? exports.THREE : {};

  THREE.terraingen = {
    generators: {},
    modifiers: {},
    noise: {},
    filters: {},
    features: {}
  };

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
      return BasicRandomProvider.__super__.constructor.apply(this, arguments);
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
      var i, s, _i, _ref;
      this.mt = [];
      this.index = 0;
      this.mt[0] = seed != null ? seed : seed = new Date().getTime();
      for (i = _i = 1, _ref = this.N; 1 <= _ref ? _i < _ref : _i > _ref; i = 1 <= _ref ? ++_i : --_i) {
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
      var i, y, _i, _ref;
      for (i = _i = 0, _ref = this.N; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
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

  floor = Math.floor, sqrt = Math.sqrt, pow = Math.pow, log = Math.log;

  THREE.terraingen.noise.NoiseProvider = (function() {
    function NoiseProvider(RNGFunction) {
      this.RNGFunction = RNGFunction != null ? RNGFunction : Math.random;
      this.getHeightAt = __bind(this.getHeightAt, this);
    }

    NoiseProvider.prototype.getHeightAt = function(x, y) {
      return 0.5;
    };

    return NoiseProvider;

  })();

  fade = function(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  };

  lerp = function(t, a, b) {
    return a + t * (b - a);
  };

  grad = function(hash, x, y, z) {
    var h, u, v;
    h = hash & 15;
    u = h < 8 ? x : y;
    v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };

  THREE.terraingen.noise.ImprovedNoise = (function(_super) {
    __extends(ImprovedNoise, _super);

    ImprovedNoise.prototype.p = [];

    ImprovedNoise.prototype.frequency = 1 / 80.0;

    ImprovedNoise.prototype.octaves = 2;

    ImprovedNoise.prototype.lacunarity = 1.4;

    ImprovedNoise.prototype.permutation = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];

    function ImprovedNoise(octaves, lacunarity) {
      var i, _i;
      this.octaves = octaves != null ? octaves : 8;
      this.lacunarity = lacunarity != null ? lacunarity : 2;
      for (i = _i = 0; _i < 256; i = _i += 1) {
        this.p[256 + 1] = this.p[i] = this.permutation[i];
      }
    }

    ImprovedNoise.prototype.getHeightAt = function(x, y, z) {
      var amplitude, frequency, i, val, _i, _ref, _x, _y;
      if (z == null) {
        z = 0.0;
      }
      frequency = 1.0;
      amplitude = 1.0;
      val = 0.0;
      for (i = _i = 0, _ref = this.octaves; _i < _ref; i = _i += 1) {
        _x = x * frequency;
        _y = y * frequency;
        val += this._getHeightAt(_x, _y, z) * amplitude;
        amplitude /= this.lacunarity;
        frequency *= this.lacunarity;
      }
      return (1.0 + val) * 0.5;
    };

    ImprovedNoise.prototype._getHeightAt = function(x, y, z) {
      var A, AA, AB, B, BA, BB, X, Y, Z, u, v, val, w;
      if (z == null) {
        z = 0.0;
      }
      x *= this.frequency;
      y *= this.frequency;
      X = floor(x) & 255;
      Y = floor(y) & 255;
      Z = floor(z) & 255;
      x -= Math.floor(x);
      y -= Math.floor(y);
      z -= Math.floor(z);
      u = fade(x);
      v = fade(y);
      w = fade(z);
      A = this.p[X] + Y;
      AA = this.p[A] + Z;
      AB = this.p[A + 1] + Z;
      B = this.p[X + 1] + Y;
      BA = this.p[B] + Z;
      BB = this.p[B + 1] + Z;
      return val = lerp(w, lerp(v, lerp(u, grad(this.p[AA], x, y, z), grad(this.p[BA], x - 1, y, z)), lerp(u, grad(this.p[AB], x, y - 1, z), grad(this.p[BB], x - 1, y - 1, z))), lerp(v, lerp(u, grad(this.p[AA + 1], x, y, z - 1), grad(this.p[BA + 1], x - 1, y, z - 1)), lerp(u, grad(this.p[AB + 1], x, y - 1, z - 1), grad(this.p[BB + 1], x - 1, y - 1, z - 1))));
    };

    return ImprovedNoise;

  })(THREE.terraingen.noise.NoiseProvider);

  THREE.terraingen.noise.fBm = (function(_super) {
    __extends(fBm, _super);

    function fBm(RNGFunction, H, lacunarity, octaves, scale) {
      var frequency, i, _i, _ref;
      this.RNGFunction = RNGFunction;
      this.H = H;
      this.lacunarity = lacunarity;
      this.octaves = octaves;
      this.scale = scale;
      this.getHeightAt = __bind(this.getHeightAt, this);
      this.exponent_array = [];
      frequency = 1.0;
      for (i = _i = 0, _ref = this.octaves + 1; _i < _ref; i = _i += 1) {
        this.exponent_array.push(pow(frequency, -this.H));
        frequency *= this.lacunarity;
      }
    }

    fBm.prototype.getHeightAt = function(x, y) {
      var frequency, i, value, _i, _ref;
      value = 0.0;
      frequency = 1.0;
      for (i = _i = 0, _ref = this.octaves; _i < _ref; i = _i += 1) {
        value += this.RNGFunction() * this.exponent_array[i];
        x *= this.lacunarity;
        y *= this.lacunarity;
      }
      return value;
    };

    return fBm;

  })(THREE.terraingen.noise.NoiseProvider);

  THREE.terraingen.noise.Perlin = (function(_super) {
    __extends(Perlin, _super);

    Perlin.prototype.cache = {};

    Perlin.prototype.grad3 = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]];

    Perlin.prototype.simplex = [[0, 1, 2, 3], [0, 1, 3, 2], [0, 0, 0, 0], [0, 2, 3, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 2, 3, 0], [0, 2, 1, 3], [0, 0, 0, 0], [0, 3, 1, 2], [0, 3, 2, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 3, 2, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 2, 0, 3], [0, 0, 0, 0], [1, 3, 0, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [2, 3, 0, 1], [2, 3, 1, 0], [1, 0, 2, 3], [1, 0, 3, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [2, 0, 3, 1], [0, 0, 0, 0], [2, 1, 3, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [2, 0, 1, 3], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 1, 2], [3, 0, 2, 1], [0, 0, 0, 0], [3, 1, 2, 0], [2, 1, 0, 3], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 1, 0, 2], [0, 0, 0, 0], [3, 2, 0, 1], [3, 2, 1, 0]];

    function Perlin(RNGFunction, octaves, scale) {
      var i, random;
      this.RNGFunction = RNGFunction != null ? RNGFunction : Math.random;
      this.octaves = octaves != null ? octaves : 8;
      this.scale = scale != null ? scale : 1.0;
      random = this.RNGFunction;
      this.p = (function() {
        var _i, _results;
        _results = [];
        for (i = _i = 0; _i < 256; i = ++_i) {
          _results.push(floor(random() * 256));
        }
        return _results;
      })();
      this.perm = (function() {
        var _i, _results;
        _results = [];
        for (i = _i = 0; _i < 512; i = ++_i) {
          _results.push(this.p[i & 255]);
        }
        return _results;
      }).call(this);
    }

    Perlin.prototype.dot = function(g, x, y) {
      return g[0] * x + g[1] * y;
    };

    Perlin.prototype.getValue = function(x, y) {
      var amplitude, hgt, o, _i, _ref;
      hgt = 0.0;
      amplitude = 1.0;
      x *= this.scale;
      y *= this.scale;
      for (o = _i = 1, _ref = this.octaves; _i < _ref; o = _i += 1) {
        hgt += (this._getHeightAt(x, y)) * amplitude;
        x *= 2.0;
        y *= 2.0;
        amplitude *= 0.5;
      }
      return hgt;
    };

    Perlin.prototype._getHeightAt = function(xin, yin) {
      var F2, G2, X0, Y0, gi0, gi1, gi2, i, i1, ii, j, j1, jj, n0, n1, n2, s, t, t0, t1, t2, x0, x1, x2, y0, y1, y2;
      F2 = 0.5 * (sqrt(3.0) - 1.0);
      s = (xin + yin) * F2;
      i = floor(xin + s);
      j = floor(yin + s);
      G2 = (3.0 - sqrt(3.0)) / 6.0;
      t = (i + j) * G2;
      X0 = i - t;
      Y0 = j - t;
      x0 = xin - X0;
      y0 = yin - Y0;
      if (x0 > y0) {
        i1 = 1;
        j1 = 0;
      } else {
        i1 = 0;
        j1 = 1;
      }
      x1 = x0 - i1 + G2;
      y1 = y0 - j1 + G2;
      x2 = x0 - 1.0 + 2.0 * G2;
      y2 = y0 - 1.0 + 2.0 * G2;
      ii = i & 255;
      jj = j & 255;
      gi0 = this.perm[ii + this.perm[jj]] % 12;
      gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
      gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;
      t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 < 0) {
        n0 = 0.0;
      } else {
        t0 *= t0;
        n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);
      }
      t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 < 0) {
        n1 = 0.0;
      } else {
        t1 *= t1;
        n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
      }
      t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 < 0) {
        n2 = 0.0;
      } else {
        t2 *= t2;
        n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
      }
      return 70.0 * (n0 + n1 + n2);
    };

    return Perlin;

  })(THREE.terraingen.noise.NoiseProvider);

  THREE.terraingen.modifiers.Modifier = (function() {
    function Modifier() {}

    Modifier.prototype.get = function(x, y, z) {
      if (z == null) {
        z = 0.0;
      }
      return 1.0;
    };

    return Modifier;

  })();

  max = Math.max, min = Math.min, abs = Math.abs, pow = Math.pow;

  THREE.terraingen.modifiers.Constant = (function(_super) {
    __extends(Constant, _super);

    function Constant(value) {
      this.value = value;
    }

    Constant.prototype.get = function(x, y, z) {
      if (z == null) {
        z = 0.0;
      }
      return this.value;
    };

    return Constant;

  })(THREE.terraingen.modifiers.Modifier);

  THREE.terraingen.modifiers.Add = (function(_super) {
    __extends(Add, _super);

    function Add(source1, source2) {
      this.source1 = source1;
      this.source2 = source2;
    }

    Add.prototype.get = function(x, y, z) {
      if (z == null) {
        z = 0.0;
      }
      return this.source1.get(x, y) + this.source2.get(x, y);
    };

    return Add;

  })(THREE.terraingen.modifiers.Modifier);

  THREE.terraingen.modifiers.Subtract = (function(_super) {
    __extends(Subtract, _super);

    function Subtract(source1, source2) {
      this.source1 = source1;
      this.source2 = source2;
    }

    Subtract.prototype.get = function(x, y, z) {
      if (z == null) {
        z = 0.0;
      }
      return this.source1.get(x, y) - this.source2.get(x, y);
    };

    return Subtract;

  })(THREE.terraingen.modifiers.Modifier);

  THREE.terraingen.modifiers.Multiply = (function(_super) {
    __extends(Multiply, _super);

    function Multiply(source1, source2) {
      this.source1 = source1;
      this.source2 = source2;
    }

    Multiply.prototype.get = function(x, y, z) {
      if (z == null) {
        z = 0.0;
      }
      return this.source1.get(x, y) * this.source2.get(x, y);
    };

    return Multiply;

  })(THREE.terraingen.modifiers.Modifier);

  THREE.terraingen.modifiers.ConvertToUnsigned = (function(_super) {
    __extends(ConvertToUnsigned, _super);

    function ConvertToUnsigned(source) {
      this.source = source;
    }

    ConvertToUnsigned.prototype.get = function(x, y, z) {
      if (z == null) {
        z = 0.0;
      }
      return (1.0 + this.source.get(x, y, z)) * 0.5;
    };

    return ConvertToUnsigned;

  })(THREE.terraingen.modifiers.Modifier);

  THREE.terraingen.modifiers.Invert = (function(_super) {
    __extends(Invert, _super);

    function Invert(source) {
      this.source = source;
    }

    Invert.prototype.get = function(x, y, z) {
      if (z == null) {
        z = 0.0;
      }
      return this.source.get(x, y, z) * -1;
    };

    return Invert;

  })(THREE.terraingen.modifiers.Modifier);

  THREE.terraingen.modifiers.Abs = (function(_super) {
    __extends(Abs, _super);

    function Abs(source) {
      this.source = source;
    }

    Abs.prototype.get = function(x, y, z) {
      if (z == null) {
        z = 0.0;
      }
      return Math.abs(this.source.get(x, y, z));
    };

    return Abs;

  })(THREE.terraingen.modifiers.Modifier);

  THREE.terraingen.modifiers.Max = (function(_super) {
    __extends(Max, _super);

    function Max(source1, source2) {
      this.source1 = source1;
      this.source2 = source2;
    }

    Max.prototype.get = function(x, y, z) {
      if (z == null) {
        z = 0.0;
      }
      return Math.max(this.source1.get(x, y, z), this.source2.get(x, y, z));
    };

    return Max;

  })(THREE.terraingen.modifiers.Modifier);

  THREE.terraingen.modifiers.Min = (function(_super) {
    __extends(Min, _super);

    function Min(source1, source2) {
      this.source1 = source1;
      this.source2 = source2;
    }

    Min.prototype.get = function(x, y, z) {
      if (z == null) {
        z = 0.0;
      }
      return Math.min(this.source1.get(x, y, z), this.source2.get(x, y, z));
    };

    return Min;

  })(THREE.terraingen.modifiers.Modifier);

  THREE.terraingen.modifiers.Pow = (function(_super) {
    __extends(Pow, _super);

    function Pow(source1, source2) {
      this.source1 = source1;
      this.source2 = source2;
    }

    Pow.prototype.get = function(x, y, z) {
      var val;
      if (z == null) {
        z = 0.0;
      }
      val = (1.0 + this.source1.get(x, y, z)) * 0.5;
      val = Math.pow(val, this.source2.get(x, y, z));
      return (val * 2.0) - 1.0;
    };

    return Pow;

  })(THREE.terraingen.modifiers.Modifier);

  THREE.terraingen.modifiers.Mix = (function(_super) {
    __extends(Mix, _super);

    function Mix(source1, source2, control) {
      this.source1 = source1;
      this.source2 = source2;
      this.control = control;
    }

    Mix.prototype.get = function(x, y, z) {
      var mix, val1, val2;
      if (z == null) {
        z = 0.0;
      }
      val1 = this.source1.get(x, y, z);
      val2 = this.source2.get(x, y, z);
      mix = (1.0 + this.control.get(x, y, z)) * 0.5;
      return (val1 * mix) + (val2 * (1.0 - mix));
    };

    return Mix;

  })(THREE.terraingen.modifiers.Modifier);

  THREE.terraingen.modifiers.Cache = (function(_super) {
    __extends(Cache, _super);

    Cache.prototype.cache = {};

    Cache.prototype.cache_misses = 0;

    Cache.prototype.cache_hits = 0;

    function Cache(source) {
      this.source = source;
    }

    Cache.prototype.get = function(x, y, z) {
      var key;
      if (z == null) {
        z = 0.0;
      }
      key = '' + x + '_' + y + '_' + z;
      if (this.cache[key] == null) {
        this.cache[key] = this.source.get(x, y, z);
      }
      return this.cache[key];
    };

    return Cache;

  })(THREE.terraingen.modifiers.Modifier);

  floor = Math.floor, sqrt = Math.sqrt, sin = Math.sin, cos = Math.cos;

  THREE.terraingen.generators.Generator = (function() {
    function Generator() {}

    Generator.prototype.filters = [];

    Generator.prototype.features = [];

    return Generator;

  })();

  ({
    constructor: function(RNGFunction) {
      this.RNGFunction = RNGFunction != null ? RNGFunction : Math.random;
    },
    get: function(x, y, z) {
      if (z == null) {
        z = 0.0;
      }
      return this.RNGFunction();
    }
  });

  THREE.terraingen.generators.SineX = (function(_super) {
    __extends(SineX, _super);

    function SineX(scaleSource) {
      this.scaleSource = scaleSource;
    }

    SineX.prototype.get = function(x, y, z) {
      if (z == null) {
        z = 0.0;
      }
      return Math.sin(x * this.scaleSource.get(x, y, z));
    };

    return SineX;

  })(THREE.terraingen.generators.Generator);

  THREE.terraingen.generators.SineY = (function(_super) {
    __extends(SineY, _super);

    function SineY(scaleSource) {
      this.scaleSource = scaleSource;
    }

    SineY.prototype.get = function(x, y, z) {
      if (z == null) {
        z = 0.0;
      }
      return Math.sin(y * this.scaleSource.get(x, y, z));
    };

    return SineY;

  })(THREE.terraingen.generators.Generator);

  THREE.terraingen.generators.SineCosXY = (function(_super) {
    __extends(SineCosXY, _super);

    function SineCosXY(scaleSource) {
      this.scaleSource = scaleSource;
    }

    SineCosXY.prototype.get = function(x, y, z) {
      var m;
      if (z == null) {
        z = 0.0;
      }
      m = this.scaleSource.get(x, y, z);
      return (sin(x + cos(y))) * m;
    };

    return SineCosXY;

  })(THREE.terraingen.generators.Generator);

  THREE.terraingen.generators.ImageMap = (function(_super) {
    __extends(ImageMap, _super);

    function ImageMap(imagePath) {}

    ImageMap.prototype.get = function(x, y, z) {
      if (z == null) {
        z = 0.0;
      }
    };

    return ImageMap;

  })(THREE.terraingen.generators.Generator);

  THREE.terraingen.generators.Perlin = (function(_super) {
    __extends(Perlin, _super);

    Perlin.prototype.cache = {};

    Perlin.prototype.grad3 = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]];

    Perlin.prototype.simplex = [[0, 1, 2, 3], [0, 1, 3, 2], [0, 0, 0, 0], [0, 2, 3, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 2, 3, 0], [0, 2, 1, 3], [0, 0, 0, 0], [0, 3, 1, 2], [0, 3, 2, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 3, 2, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 2, 0, 3], [0, 0, 0, 0], [1, 3, 0, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [2, 3, 0, 1], [2, 3, 1, 0], [1, 0, 2, 3], [1, 0, 3, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [2, 0, 3, 1], [0, 0, 0, 0], [2, 1, 3, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [2, 0, 1, 3], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 1, 2], [3, 0, 2, 1], [0, 0, 0, 0], [3, 1, 2, 0], [2, 1, 0, 3], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 1, 0, 2], [0, 0, 0, 0], [3, 2, 0, 1], [3, 2, 1, 0]];

    function Perlin(RNGFunction, octaves, scale) {
      var i, random;
      this.RNGFunction = RNGFunction != null ? RNGFunction : Math.random;
      this.octaves = octaves != null ? octaves : 8;
      this.scale = scale != null ? scale : 1.0;
      random = this.RNGFunction;
      this.p = (function() {
        var _i, _results;
        _results = [];
        for (i = _i = 0; _i < 256; i = ++_i) {
          _results.push(Math.floor(random() * 256));
        }
        return _results;
      })();
      this.perm = (function() {
        var _i, _results;
        _results = [];
        for (i = _i = 0; _i < 512; i = ++_i) {
          _results.push(this.p[i & 255]);
        }
        return _results;
      }).call(this);
    }

    Perlin.prototype.dot = function(g, x, y) {
      return g[0] * x + g[1] * y;
    };

    Perlin.prototype.get = function(x, y, z) {
      var amplitude, hgt, o, _i, _ref;
      if (z == null) {
        z = 0.0;
      }
      hgt = 0.0;
      amplitude = 1.0;
      x *= this.scale;
      y *= this.scale;
      for (o = _i = 1, _ref = this.octaves; _i < _ref; o = _i += 1) {
        hgt += (this._getHeightAt(x, y)) * amplitude;
        x *= 2.0;
        y *= 2.0;
        amplitude *= 0.5;
      }
      return hgt;
    };

    Perlin.prototype._getHeightAt = function(xin, yin) {
      var F2, G2, X0, Y0, gi0, gi1, gi2, i, i1, ii, j, j1, jj, n0, n1, n2, s, t, t0, t1, t2, x0, x1, x2, y0, y1, y2;
      F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
      s = (xin + yin) * F2;
      i = Math.floor(xin + s);
      j = Math.floor(yin + s);
      G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
      t = (i + j) * G2;
      X0 = i - t;
      Y0 = j - t;
      x0 = xin - X0;
      y0 = yin - Y0;
      if (x0 > y0) {
        i1 = 1;
        j1 = 0;
      } else {
        i1 = 0;
        j1 = 1;
      }
      x1 = x0 - i1 + G2;
      y1 = y0 - j1 + G2;
      x2 = x0 - 1.0 + 2.0 * G2;
      y2 = y0 - 1.0 + 2.0 * G2;
      ii = i & 255;
      jj = j & 255;
      gi0 = this.perm[ii + this.perm[jj]] % 12;
      gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
      gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;
      t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 < 0) {
        n0 = 0.0;
      } else {
        t0 *= t0;
        n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);
      }
      t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 < 0) {
        n1 = 0.0;
      } else {
        t1 *= t1;
        n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
      }
      t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 < 0) {
        n2 = 0.0;
      } else {
        t2 *= t2;
        n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
      }
      return 70.0 * (n0 + n1 + n2);
    };

    return Perlin;

  })(THREE.terraingen.generators.Generator);

  THREE.terraingen.GeometryProvider = (function() {
    GeometryProvider.prototype.geometry = null;

    GeometryProvider.prototype.source = null;

    GeometryProvider.prototype.x = 0;

    GeometryProvider.prototype.y = 0;

    GeometryProvider.prototype.width = 257;

    GeometryProvider.prototype.height = 257;

    function GeometryProvider(source) {
      this.source = source;
    }

    GeometryProvider.prototype.setRegion = function(x, y, width, height) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.width = width != null ? width : 257;
      this.height = height != null ? height : 257;
    };

    GeometryProvider.prototype.get = function() {
      return new THREE.BufferGeometry;
    };

    return GeometryProvider;

  })();

  THREE.terraingen.BTTGeometryProvider = (function(_super) {
    __extends(BTTGeometryProvider, _super);

    function BTTGeometryProvider(source) {
      this.source = source;
    }

    BTTGeometryProvider.prototype.get = function(maxVariance) {
      var btt;
      if (maxVariance == null) {
        maxVariance = 0.05;
      }
      btt = new THREE.terraingen.BTT(this.x, this.y, this.width, this.height, this.source, maxVariance);
      return this.createSkirts(btt.build());
    };

    BTTGeometryProvider.prototype.createSkirts = function(geom) {
      var edgeVerts, f, face, uva, uvb, uvc, uvs, _i, _ref;
      for (f = _i = 0, _ref = geom.faces.length; _i < _ref; f = _i += 1) {
        edgeVerts = [];
        uvs = geom.faceVertexUvs[0][f];
        uva = uvs[0];
        uvb = uvs[1];
        uvc = uvs[2];
        face = geom.faces[f];
        if (uva.x === 0 || uva.x === 1 || uva.y === 0 || uva.y === 1) {
          edgeVerts.push(geom.vertices[face.a]);
        }
        if (uvb.x === 0 || uvb.x === 1 || uvb.y === 0 || uvb.y === 1) {
          edgeVerts.push(geom.vertices[face.b]);
        }
        if (uvc.x === 0 || uvc.x === 1 || uvc.y === 0 || uvc.y === 1) {
          edgeVerts.push(geom.vertices[face.c]);
        }
      }
      return geom;
    };

    return BTTGeometryProvider;

  })(THREE.terraingen.GeometryProvider);

  THREE.terraingen.AABB = (function() {
    function AABB(center, halfSize) {
      this.c = center;
      this.hs = halfSize;
      this.computeBounds();
    }

    AABB.prototype.computeBounds = function() {
      var xmax, xmin, ymax, ymin;
      xmin = this.c.x - this.hs;
      ymin = this.c.y - this.hs;
      xmax = this.c.x + this.hs;
      ymax = this.c.y + this.hs;
      this.min = new THREE.Vector2(xmin, ymin);
      this.max = new THREE.Vector2(xmax, ymax);
      this.width = this.height = this.hs * 2;
    };

    AABB.prototype.containsPoint = function(point) {
      if (point.x < this.min.x || point.x > this.max.x || point.y < this.min.y || point.y > this.max.y) {
        return false;
      }
      return true;
    };

    AABB.prototype.containsAABB = function(box) {
      if ((this.min.x <= box.min.x) && (box.max.x <= this.max.x) && (this.min.y <= box.min.y) && (box.max.x <= this.max.y)) {
        return true;
      }
      return false;
    };

    AABB.prototype.intersects = function(box) {
      if (box.max.x < this.min.x || box.min.x > this.max.x || box.max.y < this.min.y || box.min.y > this.max.y) {
        return false;
      }
      return true;
    };

    return AABB;

  })();

  THREE.terraingen.PlaneGeometryProvider = (function(_super) {
    __extends(PlaneGeometryProvider, _super);

    PlaneGeometryProvider.prototype.vertsPerSide = 32;

    function PlaneGeometryProvider(source) {
      this.source = source;
      this.lod = 1.0;
    }

    PlaneGeometryProvider.prototype.setBounds = function(bounds) {
      this.bounds = bounds;
    };

    PlaneGeometryProvider.prototype.setRegion = function(x, y, width, height) {
      var c, hs;
      hs = width / 2;
      c = new THREE.Vector2(x + hs, y + hs);
      return this.bounds = new THREE.terraingen.AABB(c, hs);
    };

    PlaneGeometryProvider.prototype.setLOD = function(lod) {
      this.lod = lod;
    };

    PlaneGeometryProvider.prototype.build = function() {
      var a, b, c, color, d, face, geom, hw, i, ix, iz, j, normal, stride, w1, x, y, _i, _j, _k, _l, _ref, _ref1;
      color = new THREE.Color(0xffffff);
      color.setRGB(Math.random(), Math.random(), Math.random());
      w1 = this.vertsPerSide + 1;
      stride = this.bounds.width / this.vertsPerSide;
      normal = new THREE.Vector3(0, 1, 0);
      geom = new THREE.Geometry();
      hw = this.bounds.width / 2;
      for (i = _i = 0; _i < w1; i = _i += 1) {
        y = i * stride;
        for (j = _j = 0; _j < w1; j = _j += 1) {
          x = j * stride;
          geom.vertices.push(new THREE.Vector3(x, 0.0, -y));
          geom.colors.push(color);
        }
      }
      for (iz = _k = 0, _ref = this.vertsPerSide; _k < _ref; iz = _k += 1) {
        for (ix = _l = 0, _ref1 = this.vertsPerSide; _l < _ref1; ix = _l += 1) {
          a = ix + w1 * iz;
          b = ix + w1 * (iz + 1);
          c = (ix + 1) + w1 * (iz + 1);
          d = (ix + 1) + w1 * iz;
          face = new THREE.Face3(a, b, d);
          face.normal.copy(normal);
          face.vertexNormals.push(normal.clone(), normal.clone(), normal.clone());
          face.vertexColors.push(color, color, color);
          geom.faces.push(face);
          face = new THREE.Face3(b, c, d);
          face.normal.copy(normal);
          face.vertexNormals.push(normal.clone(), normal.clone(), normal.clone());
          face.vertexColors.push(color, color, color);
          geom.faces.push(face);
        }
      }
      console.log(geom);
      return geom;
    };

    PlaneGeometryProvider.prototype.get = function() {
      return this.build();
    };

    return PlaneGeometryProvider;

  })(THREE.terraingen.GeometryProvider);

  THREE.terraingen.BTT = (function() {
    BTT.prototype.maxVariance = 0.02;

    BTT.prototype.squareUnits = 1;

    BTT.prototype.heightScale = 1;

    function BTT(x, y, width, height, heightMapProvider, maxVariance) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.heightMapProvider = heightMapProvider;
      this.maxVariance = maxVariance;
      this.tree = [];
    }

    BTT.prototype.cleanup = function() {
      return this.tree = [];
    };

    BTT.prototype.build = function() {
      var geom;
      this.tree = [];
      geom = new THREE.Geometry();
      this.createVertexBuffer(geom);
      this.buildTree(this.width, this.height, geom);
      this.createIndexBuffer(geom);
      this.cleanup();
      return geom;
    };

    BTT.prototype.createVertexBuffer = function(geom) {
      var alt, i, j, _i, _ref, _results;
      console.log(this.width, this.height);
      _results = [];
      for (i = _i = 0, _ref = this.width; _i < _ref; i = _i += 1) {
        _results.push((function() {
          var _j, _ref1, _results1;
          _results1 = [];
          for (j = _j = 0, _ref1 = this.height; _j < _ref1; j = _j += 1) {
            alt = (this.heightMapProvider.get(this.x + (i * this.squareUnits), this.y + (j * this.squareUnits))) * this.heightScale;
            _results1.push(geom.vertices.push(new THREE.Vector3(i * this.squareUnits, alt, j * this.squareUnits)));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    BTT.prototype.createIndexBuffer = function(geom) {
      var h, i, uva, uvb, uvc, v1, v2, v3, w, _i, _ref, _v1, _v2, _v3;
      w = (this.width - 1) * this.squareUnits;
      h = (this.height - 1) * this.squareUnits;
      for (i = _i = 0, _ref = this.tree.length; _i < _ref; i = _i += 1) {
        if (this.tree[i].lc == null) {
          v1 = this.tree[i].v1;
          v2 = this.tree[i].v2;
          v3 = this.tree[i].v3;
          geom.faces.push(new THREE.Face3(v1, v2, v3));
          _v1 = geom.vertices[v1];
          _v2 = geom.vertices[v2];
          _v3 = geom.vertices[v3];
          uva = new THREE.Vector2(_v1.x / w, _v1.z / h);
          uvb = new THREE.Vector2(_v2.x / w, _v2.z / h);
          uvc = new THREE.Vector2(_v3.x / w, _v3.z / h);
          geom.faceVertexUvs[0].push([uva, uvb, uvc]);
        }
      }
    };

    BTT.prototype.getSeriazlized = function() {
      var i, result, _i, _ref;
      result = "";
      for (i = _i = 0, _ref = this.tree.length; _i < _ref; i = _i += 1) {
        if (this.tree[i].lc == null) {
          result += "0";
        } else {
          result += "1";
        }
      }
      return result;
    };

    BTT.prototype.newTri = function(v1, v2, v3) {
      return {
        v1: v1,
        v2: v2,
        v3: v3,
        ln: null,
        rn: null,
        bn: null,
        lc: null,
        rc: null
      };
    };

    BTT.prototype.getVariance = function(v1, v2, v3, geom) {
      var alt, hi, hj, v, vh;
      if (Math.abs(geom.vertices[v3].x - geom.vertices[v1].x) > this.squareUnits || Math.abs(geom.vertices[v3].z - geom.vertices[v1].z) > this.squareUnits) {
        hi = Math.round(((geom.vertices[v3].x / this.squareUnits) - (geom.vertices[v1].x / this.squareUnits)) / 2 + (geom.vertices[v1].x / this.squareUnits));
        hj = Math.round(((geom.vertices[v3].z / this.squareUnits) - (geom.vertices[v1].z / this.squareUnits)) / 2 + (geom.vertices[v1].z / this.squareUnits));
        vh = Math.round(hi * this.width + hj);
        alt = this.heightMapProvider.get(this.x + hi, this.y + hj);
        v = Math.abs(alt - ((geom.vertices[v1].y + geom.vertices[v3].y) / 2));
        v = Math.max(v, this.getVariance(v2, vh, v1, geom));
        v = Math.max(v, this.getVariance(v3, vh, v2, geom));
      } else {
        v = 0;
      }
      return v;
    };

    BTT.prototype.buildTree = function(width, height, geom) {
      this.tree.push(this.newTri(0, width - 1, width + (width * (height - 1)) - 1));
      this.tree.push(this.newTri(width - 1 + (width * (height - 1)), width * (height - 1), 0));
      this.tree[0].bn = 1;
      this.tree[1].bn = 0;
      this.buildFace(0, geom);
      this.buildFace(1, geom);
    };

    BTT.prototype.buildFace = function(f, geom) {
      var v1, v2, v3;
      if (this.tree[f].lc != null) {
        this.buildFace(this.tree[f].lc, geom);
        this.buildFace(this.tree[f].rc, geom);
      } else {
        v1 = this.tree[f].v1;
        v2 = this.tree[f].v2;
        v3 = this.tree[f].v3;
        if (this.getVariance(v1, v2, v3, geom) > this.maxVariance) {
          this.splitFace(f, geom);
          this.buildFace(this.tree[f].lc, geom);
          this.buildFace(this.tree[f].rc, geom);
        }
      }
    };

    BTT.prototype.splitFace = function(f, geom) {
      if (this.tree[f].bn != null) {
        if (this.tree[this.tree[f].bn].bn !== f) {
          this.splitFace(this.tree[f].bn, geom);
        }
        this.splitFace2(f, geom);
        this.splitFace2(this.tree[f].bn, geom);
        this.tree[this.tree[f].lc].rn = this.tree[this.tree[f].bn].rc;
        this.tree[this.tree[f].rc].ln = this.tree[this.tree[f].bn].lc;
        this.tree[this.tree[this.tree[f].bn].lc].rn = this.tree[f].rc;
        this.tree[this.tree[this.tree[f].bn].rc].ln = this.tree[f].lc;
      } else {
        this.splitFace2(f, geom);
      }
    };

    BTT.prototype.getApexIndex = function(v1, v2, v3) {};

    BTT.prototype.splitFace2 = function(f, geom) {
      var hi, hj, v1, v2, v3, vh;
      v1 = this.tree[f].v1;
      v2 = this.tree[f].v2;
      v3 = this.tree[f].v3;
      hi = ((geom.vertices[v3].x / this.squareUnits) - (geom.vertices[v1].x / this.squareUnits)) / 2 + (geom.vertices[v1].x / this.squareUnits);
      hj = ((geom.vertices[v3].z / this.squareUnits) - (geom.vertices[v1].z / this.squareUnits)) / 2 + (geom.vertices[v1].z / this.squareUnits);
      vh = Math.round(hi * this.width + hj);
      this.tree.push(this.newTri(v2, vh, v1));
      this.tree[f].lc = this.tree.length - 1;
      this.tree.push(this.newTri(v3, vh, v2));
      this.tree[f].rc = this.tree.length - 1;
      this.tree[this.tree[f].lc].ln = this.tree[f].rc;
      this.tree[this.tree[f].rc].rn = this.tree[f].lc;
      this.tree[this.tree[f].lc].bn = this.tree[f].ln;
      if (this.tree[f].ln != null) {
        if (this.tree[this.tree[f].ln].bn === f) {
          this.tree[this.tree[f].ln].bn = this.tree[f].lc;
        } else {
          if (this.tree[this.tree[f].ln].ln === f) {
            this.tree[this.tree[f].ln].ln = this.tree[f].lc;
          } else {
            this.tree[this.tree[f].ln].rn = this.tree[f].lc;
          }
        }
      }
      this.tree[this.tree[f].rc].bn = this.tree[f].rn;
      if (this.tree[f].rn != null) {
        if (this.tree[this.tree[f].rn].bn === f) {
          this.tree[this.tree[f].rn].bn = this.tree[f].rc;
        } else {
          if (this.tree[this.tree[f].rn].rn === f) {
            this.tree[this.tree[f].rn].rn = this.tree[f].rc;
          } else {
            this.tree[this.tree[f].rn].ln = this.tree[f].rc;
          }
        }
      }
    };

    return BTT;

  })();

  THREE.terraingen.GridGeometryProvider = (function(_super) {
    __extends(GridGeometryProvider, _super);

    function GridGeometryProvider(x, y, width, height, segments) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.width = width != null ? width : 256;
      this.height = height != null ? height : 256;
      this.segments = segments != null ? segments : 128;
    }

    GridGeometryProvider.prototype._build = function() {
      var a, b, c, d, face, gridX, gridX1, gridZ, gridZ1, height_half, hgt, ix, iz, normal, segment_height, segment_width, uva, uvb, uvc, uvd, width_half, x, y, _i, _j, _k, _results;
      this.geometry = new THREE.Geometry;
      width_half = this.width / 2;
      height_half = this.height / 2;
      gridX = this.segments;
      gridZ = this.segments;
      gridX1 = gridX + 1;
      gridZ1 = gridZ + 1;
      segment_width = this.width / gridX;
      segment_height = this.height / gridZ;
      normal = new THREE.Vector3(0, 0, 1);
      for (iz = _i = 0; _i < gridZ1; iz = _i += 1) {
        y = iz * segment_height;
        for (ix = _j = 0; _j < gridX1; ix = _j += 1) {
          x = ix * segment_width;
          hgt = this.source.get(x, y);
          this.geometry.vertices.push(new THREE.Vector3(x, hgt, y));
        }
      }
      _results = [];
      for (iz = _k = 0; _k < gridZ; iz = _k += 1) {
        _results.push((function() {
          var _l, _results1;
          _results1 = [];
          for (ix = _l = 0; _l < gridX; ix = _l += 1) {
            a = ix + gridX1 * iz;
            b = ix + gridX1 * (iz + 1);
            c = (ix + 1) + gridX1 * (iz + 1);
            d = (ix + 1) + gridX1 * iz;
            uva = new THREE.Vector2(ix / gridX, 1 - iz / gridZ);
            uvb = new THREE.Vector2(ix / gridX, 1 - (iz + 1) / gridZ);
            uvc = new THREE.Vector2((ix + 1) / gridX, 1 - (iz + 1) / gridZ);
            uvd = new THREE.Vector2((ix + 1) / gridX, 1 - iz / gridZ);
            face = new THREE.Face3(a, b, d);
            face.normal.copy(normal);
            face.vertexNormals.push(normal.clone(), normal.clone(), normal.clone());
            this.geometry.faces.push(face);
            this.geometry.faceVertexUvs[0].push([uva, uvb, uvc]);
            face = new THREE.Face3(d, b, c);
            face.normal.copy(normal);
            face.vertexNormals.push(normal.clone(), normal.clone(), normal.clone());
            this.geometry.faces.push(face);
            _results1.push(this.geometry.faceVertexUvs[0].push([uvb.clone(), uvc, uvd.clone()]));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    GridGeometryProvider.prototype.get = function() {
      this._build();
      return this.geometry;
    };

    return GridGeometryProvider;

  })(THREE.terraingen.GeometryProvider);

  THREE.terraingen.MeshProvider = (function() {
    MeshProvider.prototype.geometryProvider = null;

    MeshProvider.prototype.materialProvider = null;

    MeshProvider.prototype.lod = 0.0001;

    function MeshProvider(geometryProvider) {
      this.geometryProvider = geometryProvider;
    }

    MeshProvider.prototype.setRegion = function(x, y, width, height) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.width = width != null ? width : 257;
      this.height = height != null ? height : 257;
    };

    MeshProvider.prototype.setBounds = function(bounds) {
      this.width = this.height = bounds.hs * 2;
      this.x = bounds.c.x - bounds.hs;
      return this.y = bounds.c.y - bounds.hs;
    };

    MeshProvider.prototype.setLOD = function(lod) {
      this.lod = lod;
    };

    MeshProvider.prototype.build = function() {
      var geom, material, mesh;
      this.geometryProvider.setRegion(this.x, this.y, this.width, this.height);
      geom = this.geometryProvider.get(this.lod);
      geom.computeFaceNormals();
      geom.computeVertexNormals(true);
      geom.mergeVertices();
      geom = new THREE.BufferGeometry().fromGeometry(geom);
      material = new THREE.MeshBasicMaterial({
        shading: THREE.SmoothShading,
        wireframe: true
      });
      return mesh = new THREE.Line(geom, material);
    };

    MeshProvider.prototype.get = function() {
      return this.build();
    };

    return MeshProvider;

  })();

  getCameraTarget = function(camera) {
    var l;
    l = new THREE.Vector3(0, 0, -100);
    camera.updateMatrixWorld();
    l.applyMatrix4(camera.matrixWorld);
    return l;
  };

  calculateCameraRect = function(camera) {
    var d, dTmp, fc, ftl, ftr, hFar, hNear, l, maxX, maxY, minX, minY, nc, ntl, ntr, p, r, rTmp, u, uTmp, wFar, wNear;
    hNear = 2 * Math.tan(camera.fov / 2) * camera.near;
    wNear = hNear * camera.aspect;
    hFar = 2 * Math.tan(camera.fov / 2) * camera.far;
    wFar = hFar * camera.aspect;
    p = camera.position.clone();
    l = getCameraTarget(camera);
    u = new THREE.Vector3(0.0, 1.0, 0.0);
    d = new THREE.Vector3();
    d.subVectors(l, p);
    d.normalize();
    r = new THREE.Vector3();
    r.crossVectors(u, d);
    r.normalize();
    dTmp = d.clone();
    nc = new THREE.Vector3();
    nc.addVectors(p, dTmp.multiplyScalar(camera.near));
    uTmp = u.clone();
    rTmp = r.clone();
    ntr = new THREE.Vector3();
    ntr.addVectors(nc, uTmp.multiplyScalar(hNear / 2));
    ntr.sub(rTmp.multiplyScalar(wNear / 2));
    uTmp.copy(u);
    rTmp.copy(r);
    ntl = new THREE.Vector3();
    ntl.addVectors(nc, uTmp.multiplyScalar(hNear / 2));
    ntl.add(rTmp.multiplyScalar(wNear / 2));
    dTmp.copy(d);
    fc = new THREE.Vector3();
    fc.addVectors(p, dTmp.multiplyScalar(camera.far));
    uTmp.copy(u);
    rTmp.copy(r);
    ftr = new THREE.Vector3();
    ftr.addVectors(fc, uTmp.multiplyScalar(hFar / 2));
    ftr.sub(rTmp.multiplyScalar(wFar / 2));
    uTmp.copy(u);
    rTmp.copy(r);
    ftl = new THREE.Vector3();
    ftl.addVectors(fc, uTmp.multiplyScalar(hFar / 2));
    ftl.add(rTmp.multiplyScalar(wFar / 2));
    minX = Math.min(ntr.x, ntl.x, ftr.x, ftl.x);
    minY = Math.min(ntr.z, ntl.z, ftr.z, ftl.z);
    maxX = Math.max(ntr.x, ntl.x, ftr.x, ftl.x);
    maxY = Math.max(ntr.z, ntl.z, ftr.z, ftl.z);
    return [minX, minY, maxX, maxY];
  };

  NW = 0;

  NE = 1;

  SW = 2;

  SE = 3;

  THREE.terraingen.Chunk = (function() {
    function Chunk(bounds, meshProvider, scene, lod) {
      this.bounds = bounds;
      this.meshProvider = meshProvider;
      this.scene = scene;
      this.lod = lod != null ? lod : 1;
      this.object = null;
      this.children = [null, null, null, null];
      this.ready = false;
    }

    Chunk.prototype.build = function() {
      if (!this.ready) {
        this.meshProvider.setLOD(this.lod);
        this.meshProvider.setBounds(this.bounds);
        this.object = this.meshProvider.get();
        this.scene.add(this.object);
        this.ready = true;
      }
      this.object.position.x -= this.bounds.hs;
      this.object.position.z += this.bounds.hs;
      return this.object;
    };

    Chunk.prototype.split = function() {
      var ne, nebox, nextLod, nw, nwbox, qw, se, sebox, sw, swbox;
      qw = this.bounds.hs / 2.0;
      nextLod = this.lod / 2.0;
      nw = new THREE.Vector2(this.bounds.c.x - qw, this.bounds.c.y - qw);
      nwbox = new THREE.terraingen.AABB(nw, qw);
      this.children[NW] = new THREE.terraingen.Chunk(nwbox, this.meshProvider, this.scene, nextLod);
      ne = new THREE.Vector2(this.bounds.c.x + qw, this.bounds.c.y - qw);
      nebox = new THREE.terraingen.AABB(ne, qw);
      this.children[NE] = new THREE.terraingen.Chunk(nebox, this.meshProvider, this.scene, nextLod);
      sw = new THREE.Vector2(this.bounds.c.x - qw, this.bounds.c.y + qw);
      swbox = new THREE.terraingen.AABB(sw, qw);
      this.children[SW] = new THREE.terraingen.Chunk(swbox, this.meshProvider, this.scene, nextLod);
      se = new THREE.Vector2(this.bounds.c.x + qw, this.bounds.c.y + qw);
      sebox = new THREE.terraingen.AABB(se, qw);
      this.children[SE] = new THREE.terraingen.Chunk(sebox, this.meshProvider, this.scene, nextLod);
    };

    Chunk.prototype.calculateRho = function(camera, K) {
      var D, pos, rho;
      pos = new THREE.Vector2(camera.position.x, camera.position.z);
      D = pos.distanceTo(this.bounds.c);
      rho = this.lod / D * K;
      return rho;
    };

    Chunk.prototype.get = function() {
      if (!this.ready) {
        this.build();
      }
      return this.object;
    };

    Chunk.prototype.draw = function(camera, K) {
      var c, tau, _i, _j, _len, _len1, _ref, _ref1, _results;
      tau = 1;
      if (this.children[0] !== null) {
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          c.object.visible = false;
        }
      }
      if (this.calculateRho(camera, K) <= tau) {
        if (!this.ready) {
          this.build();
        }
        return this.object.visible = true;
      } else {
        if (this.object !== null) {
          this.object.visible = false;
        }
        if (this.children[0] === null) {
          this.split();
        }
        _ref1 = this.children;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          c = _ref1[_j];
          _results.push(c.draw(camera, K));
        }
        return _results;
      }
    };

    return Chunk;

  })();

  THREE.terraingen.Patch = (function() {
    Patch.prototype.parent = null;

    function Patch(x, y, width, height, meshProvider, parent) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.width = width != null ? width : 33;
      this.height = height != null ? height : 33;
      this.meshProvider = meshProvider;
      this.parent = parent != null ? parent : null;
      this.object = new THREE.LOD();
      this.meshProvider.setRegion(this.x, this.y, this.width, this.height);
      this.object.position.x = this.x;
      this.object.position.z = this.y;
      this.ready = this.building = false;
      this.distance = Infinity;
    }

    Patch.prototype.addLOD = function(level, distance) {
      var obj;
      this.meshProvider.lod = level;
      this.meshProvider.setRegion(this.x, this.y, this.width, this.height);
      obj = this.meshProvider.get();
      return this.object.addLevel(obj, distance);
    };

    Patch.prototype.get = function() {
      return this.object;
    };

    return Patch;

  })();

  THREE.terraingen.Tile = (function() {
    Tile.prototype.lods = [
      {
        level: 0.005,
        distance: 200
      }, {
        level: 0.02,
        distance: 400
      }, {
        level: 0.06,
        distance: 800
      }
    ];

    function Tile(x, y, meshProvider) {
      var i, j, patch, _i, _j;
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.meshProvider = meshProvider;
      this.queue = [];
      this.patches = [];
      this.object = new THREE.Object3D();
      this.ready = false;
      this.doLOD = true;
      for (i = _i = 0; _i < 16; i = _i += 1) {
        for (j = _j = 0; _j < 16; j = _j += 1) {
          patch = new THREE.terraingen.Patch(this.x + (i * 32), this.y + (j * 32), 33, 33, this.meshProvider, this);
          this.queue.push(patch);
        }
      }
    }

    Tile.prototype.build = function() {
      var lod, next, _i, _len, _ref;
      if (!this.ready) {
        if (this.queue.length) {
          next = this.queue.pop();
          _ref = this.lods;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            lod = _ref[_i];
            next.addLOD(lod.level, lod.distance);
          }
          this.patches.push(next);
          return this.object.add(next.get());
        } else {
          return this.ready = true;
        }
      }
    };

    Tile.prototype.buildPatch = function(patch) {
      var lod, _i, _len, _ref;
      _ref = this.lods;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        lod = _ref[_i];
        patch.addLOD(lod.level, lod.distance);
      }
      patch.ready = true;
      return this.object.add(patch.get());
    };

    Tile.prototype.addCompletedPatch = function(patch) {
      this.patches.push(patch);
      return this.object.add(patch.object);
    };

    Tile.prototype.update = function(camera, frustum) {
      var contains, not_to_build, p, to_build, _i, _j, _len, _len1, _ref, _ref1;
      to_build = [];
      if (this.queue.length) {
        not_to_build = [];
        _ref = this.queue;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          p = _ref[_i];
          contains = frustum.containsPoint(p.object.position);
          if (contains) {
            to_build.push(p);
          } else {
            not_to_build.push(p);
          }
        }
        this.queue = not_to_build;
      }
      if (this.doLOD) {
        _ref1 = this.patches;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          p = _ref1[_j];
          contains = frustum.containsPoint(p.object.position);
          if (contains) {
            p.object.update(camera);
          }
          p.object.visible = contains;
        }
      }
      return to_build;
    };

    Tile.prototype.get = function() {
      return this.object;
    };

    return Tile;

  })();

  THREE.terraingen.TileManager = (function() {
    TileManager.prototype.lods = [
      {
        level: 0.002,
        distance: 200
      }, {
        level: 0.007,
        distance: 600
      }, {
        level: 0.04,
        distance: 1200
      }
    ];

    function TileManager(meshProvider, scene) {
      var i, j, obj, tile, _i, _j;
      this.meshProvider = meshProvider;
      this.scene = scene;
      this.tiles = [];
      this.queue = [];
      this.currentTile = null;
      this.frustum = new THREE.Frustum();
      this.cameraRect = [];
      this.lastQueueLength = 0;
      for (i = _i = -2; _i < 2; i = ++_i) {
        for (j = _j = -2; _j < 2; j = ++_j) {
          tile = new THREE.terraingen.Tile(i * 512, j * 512, this.meshProvider);
          obj = tile.get();
          obj.scale.y = 150;
          this.scene.add(obj);
          this.tiles.push(tile);
        }
      }
    }

    TileManager.prototype.buildPatch = function(patch) {
      var lod, _i, _len, _ref;
      _ref = this.lods;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        lod = _ref[_i];
        patch.addLOD(lod.level, lod.distance);
      }
      return patch.parent.addCompletedPatch(patch);
    };

    TileManager.prototype.update = function(camera) {
      var b, patch, tile, to_build, _i, _j, _len, _len1, _ref;
      this.frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
      this.cameraRect = calculateCameraRect(camera);
      if (this.queue.length) {
        patch = this.queue.pop();
        if (!this.frustum.containsPoint(patch.object.position)) {
          patch.parent.queue.push(patch);
        } else {
          this.buildPatch(patch);
        }
      }
      _ref = this.tiles;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tile = _ref[_i];
        to_build = tile.update(camera, this.frustum);
        for (_j = 0, _len1 = to_build.length; _j < _len1; _j++) {
          b = to_build[_j];
          b.distance = camera.position.distanceToSquared(b.object.position);
          this.queue.push(b);
        }
      }
    };

    return TileManager;

  })();

  QuadTreeNode = (function() {
    QuadTreeNode.prototype.maxobjects = 8;

    function QuadTreeNode(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.children = null;
      this.objects = [];
    }

    QuadTreeNode.prototype.add = function(object) {
      var hh, hw, node, obj, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results;
      if (this.objects) {
        this.objects.push(object);
        if (this.objects.length > this.maxobjects) {
          hw = this.width * 0.5;
          hh = this.height * 0.5;
          this.children = [new QuadTreeNode(this.x, this.y, hw, hh), new QuadTreeNode(this.x + hw, this.y, hw, hh), new QuadTreeNode(this.x, this.y + hh, hw, hh), new QuadTreeNode(this.x + hw, this.y + hh, hw, hh)];
          _ref = this.objects;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            obj = _ref[_i];
            _ref1 = this.children;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              node = _ref1[_j];
              if (node.contains(obj)) {
                node.add(obj);
              }
            }
          }
          return this.objects = null;
        } else {
          _ref2 = this.children;
          _results = [];
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            node = _ref2[_k];
            if (node.contains(object)) {
              _results.push(node.add(object));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      }
    };

    return QuadTreeNode;

  })();

  THREE.terraingen.filters.Filter = (function() {
    function Filter() {
      this.apply = __bind(this.apply, this);
    }

    Filter.prototype.apply = function(val) {
      return val;
    };

    return Filter;

  })();

  THREE.terraingen.filters.LowPass = (function(_super) {
    __extends(LowPass, _super);

    function LowPass(cutoff) {
      this.cutoff = cutoff != null ? cutoff : 1.0;
      this.apply = __bind(this.apply, this);
    }

    LowPass.prototype.apply = function(val) {
      return Math.max(val, this.cutoff);
    };

    return LowPass;

  })(THREE.terraingen.filters.Filter);

  THREE.terraingen.filters.HighPass = (function(_super) {
    __extends(HighPass, _super);

    function HighPass(cutoff) {
      this.cutoff = cutoff != null ? cutoff : 1.0;
      this.apply = __bind(this.apply, this);
    }

    HighPass.prototype.apply = function(val) {
      return Math.min(val, this.cutoff);
    };

    return HighPass;

  })(THREE.terraingen.filters.Filter);

  pow = Math.pow, sqrt = Math.sqrt, floor = Math.floor;

  THREE.terraingen.features.Road = (function() {
    function Road(start, end, width) {
      this.start = start;
      this.end = end;
      this.width = width != null ? width : 2;
    }

    return Road;

  })();

  ({
    getClosestPointToLine: function(A, B, P) {
      var a_to_b, a_to_p, atb2, atp_dot_atb, t;
      a_to_p = [P[0] - A[0], P[1] - A[1]];
      a_to_b = [B[0] - A[0], B[1] - A[1]];
      atb2 = pow(a_to_b[0], 2) + pow(a_to_b[1], 2);
      atp_dot_atb = a_to_p[0] * a_to_b[0] + a_to_p[1] * a_to_b[1];
      t = atp_dot_atb / atb2;
      return [A.x + a_to_b[0] * t, A.y + a_to_b[1] * t];
    },
    distance2d: function(A, B) {
      var xs, ys;
      xs = B[0] - A[0];
      ys = B[1] - A[1];
      return sqrt(xs * xs, ys * ys);
    }
  });

  THREE.terraingen.features.Feature = (function() {
    function Feature() {}

    return Feature;

  })();

  THREE.terraingen.features.Roads = (function(_super) {
    __extends(Roads, _super);

    function Roads(roads) {
      this.roads = roads;
      this.filterPoint = __bind(this.filterPoint, this);
    }

    Roads.prototype.filterPoint = function(pos, heightMapProvider) {
      var point_on_road, r, road_height, _i, _len, _ref;
      _ref = this.roads;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        r = _ref[_i];
        point_on_road = getClosestPointToLine(r.start, r.end, pos);
        if (distance2d(pos, point_on_road) <= r.width) {
          road_height = heightMapProvider.getHeightAt(point_on_road[0], point_on_road[1]);
          return road_height;
        }
      }
      return heightMapProvider.getHeightAt(pos[0], pos[1]);
    };

    return Roads;

  })(THREE.terraingen.features.Feature);

  THREE.terraingen.filters.Cliffs = (function(_super) {
    __extends(Cliffs, _super);

    function Cliffs(plainLevel, range) {
      this.plainLevel = plainLevel != null ? plainLevel : 0.5;
      this.range = range != null ? range : 0.2;
      this.apply = __bind(this.apply, this);
      this.halfRange = this.range / 2;
      this.lowerBound = this.plainLevel - this.halfRange;
      this.upperBound = this.plainLevel + this.halfRange;
    }

    Cliffs.prototype.apply = function(val) {
      if ((this.lowerBound < val && val < this.upperBound)) {
        return this.plainLevel;
      }
      return val;
    };

    return Cliffs;

  })(THREE.terraingen.filters.Filter);

}).call(this);
