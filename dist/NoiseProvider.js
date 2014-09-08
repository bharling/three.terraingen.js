(function() {
  var THREE, fade, floor, grad, lerp, log, pow, sqrt,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  THREE = window.THREE || {};

  THREE.terraingen = THREE.terraingen || {};

  THREE.terraingen.noise = THREE.terraingen.noise || {};

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

}).call(this);
