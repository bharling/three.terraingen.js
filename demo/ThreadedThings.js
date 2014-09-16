(function() {
  var abs, floor, sqrt;

  sqrt = Math.sqrt, floor = Math.floor, abs = Math.abs;

  window.NoiseGenerator = {
    ready: false,
    N: 624,
    FF: 0xFFFFFFFF,
    Seed: 48932432,
    grad3: [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]],
    simplex: [[0, 1, 2, 3], [0, 1, 3, 2], [0, 0, 0, 0], [0, 2, 3, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 2, 3, 0], [0, 2, 1, 3], [0, 0, 0, 0], [0, 3, 1, 2], [0, 3, 2, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 3, 2, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 2, 0, 3], [0, 0, 0, 0], [1, 3, 0, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [2, 3, 0, 1], [2, 3, 1, 0], [1, 0, 2, 3], [1, 0, 3, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [2, 0, 3, 1], [0, 0, 0, 0], [2, 1, 3, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [2, 0, 1, 3], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 1, 2], [3, 0, 2, 1], [0, 0, 0, 0], [3, 1, 2, 0], [2, 1, 0, 3], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 1, 0, 2], [0, 0, 0, 0], [3, 2, 0, 1], [3, 2, 1, 0]],
    initRandom: function(seed) {
      var i, s, _i, _ref;
      this.mt = [];
      this.index = 0;
      this.mt[0] = seed;
      for (i = _i = 1, _ref = this.N; 1 <= _ref ? _i < _ref : _i > _ref; i = 1 <= _ref ? ++_i : --_i) {
        s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
        this.mt[i] = ((((((s & 0xffff0000) >>> 16) * 0x6C078965) << 16) + (s & 0xffff) * 0x6C078965) + i) >>> 0;
      }
      return this.ready = true;
    },
    initMap: function() {
      var i;
      this.p = (function() {
        var _i, _results;
        _results = [];
        for (i = _i = 0; _i < 256; i = ++_i) {
          _results.push(Math.floor(this.rand() * 256));
        }
        return _results;
      }).call(this);
      return this.perm = (function() {
        var _i, _results;
        _results = [];
        for (i = _i = 0; _i < 512; i = ++_i) {
          _results.push(this.p[i & 255]);
        }
        return _results;
      }).call(this);
    },
    next: function() {
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
    },
    twist: function() {
      var i, y, _i, _ref;
      for (i = _i = 0, _ref = this.N; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        y = (this.mt[i] & 0x80000000) | (this.mt[(i + 1) % this.N] & 0x7FFFFFFF);
        this.mt[i] = (this.mt[(i + 397) % this.N] ^ (y >>> 1)) >>> 0;
        if ((y & 1) !== 0) {
          this.mt[i] = (this.mt[i] ^ 0x9908B0DF) >>> 0;
        }
      }
      return null;
    },
    rand: function() {
      return this.next() * (1.0 / 4294967295.0);
    },
    dot: function(g, x, y) {
      return g[0] * x + g[1] * y;
    },
    fillGeometry: function(data) {
      var t;
      t = new THREE.Geometry();
      return t;
    },
    getVertices: function(data) {
      var height, i, j, jj, octaves, result, scale, stepX, stepY, width, x, y, _h, _i, _j, _w, _x, _y;
      x = data.bounds.min.x;
      y = data.bounds.min.y;
      width = height = data.segments + 1;
      octaves = data.octaves;
      scale = data.scale;
      result = data.vertices;
      _w = data.bounds.max.x - data.bounds.min.x;
      _h = data.bounds.max.y - data.bounds.min.y;
      stepX = Math.abs(_w / data.segments);
      stepY = Math.abs(_h / data.segments);
      jj = 0;
      for (i = _i = 0; _i < height; i = _i += 1) {
        _y = y + (i * stepY);
        for (j = _j = 0; _j < width; j = _j += 1) {
          _x = x + (j * stepX);
          data.vertices[jj] = j * stepY;
          data.vertices[jj + 1] = this.getNoiseValue(_x, _y, 0.0, octaves, scale) * 300.0;
          data.vertices[jj + 2] = i * stepX;
          jj += 3;
        }
      }
      return data;
    },
    getRegion: function(data) {
      var cfg, height, i, j, jj, octaves, result, rx, ry, scale, width, x, y, _i, _j, _x, _y;
      this.initRandom(parseInt(data.seed));
      this.initMap();
      x = data.x;
      y = data.y;
      rx = data.x;
      ry = data.y;
      width = data.width;
      height = data.height;
      octaves = data.octaves;
      scale = data.scale;
      result = data.container;
      jj = 0;
      for (i = _i = 0; _i < width; i = _i += 1) {
        _x = x + i;
        for (j = _j = 0; _j < height; j = _j += 1) {
          _y = y + j;
          result[jj] = this.getNoiseValue(_x, _y, 0.0, octaves, scale);
          jj++;
        }
      }
      cfg = {
        x: rx,
        y: ry
      };
      return data;
    },
    getNoiseValue: function(x, y, z, octaves, scale) {
      var amplitude, hgt, o, _i;
      if (z == null) {
        z = 0.0;
      }
      if (octaves == null) {
        octaves = 8;
      }
      if (scale == null) {
        scale = 1.0;
      }
      return this.noiseGenerator.get(x, y);
      hgt = 0.0;
      amplitude = 1.0;
      x *= scale;
      y *= scale;
      for (o = _i = 1; _i < octaves; o = _i += 1) {
        hgt += (this.getHeightAt(x, y)) * amplitude;
        x *= 2.0;
        y *= 2.0;
        amplitude *= 0.5;
      }
      return hgt * 0.3;
    },
    getHeightAt: function(xin, yin) {
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
    }
  };

}).call(this);
