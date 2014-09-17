(function() {
  var abs, floor, sqrt;

  sqrt = Math.sqrt, floor = Math.floor, abs = Math.abs;

  window.TerrainWorker = {
    ready: false,
    N: 624,
    FF: 0xFFFFFFFF,
    Seed: 48932432,
    varianceTree: [],
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
          data.vertices[jj + 1] = this.getNoiseValue(_x, _y, 0.0, octaves, scale) * 500.0;
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
    }
  };

}).call(this);
