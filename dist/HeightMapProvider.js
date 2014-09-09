(function() {
  var THREE, floor, sqrt,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  THREE = window.THREE || {};

  THREE.terraingen = THREE.terraingen || {};

  THREE.terraingen.generators = THREE.terraingen.generators || {};

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

  floor = Math.floor, sqrt = Math.sqrt;

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

  })(THREE.terraingen.generators.Generator);

}).call(this);
