(function() {
  var abs, floor, sqrt,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  sqrt = Math.sqrt, floor = Math.floor, abs = Math.abs;

  window.THREE || (window.THREE = {});

  THREE.terraingen || (THREE.terraingen = {});

  THREE.Vector3Buffer = (function(_super) {
    __extends(Vector3Buffer, _super);

    function Vector3Buffer(length) {
      var i, _i, _ref;
      this.length = length;
      this.bufStorage = new ArrayBuffer(3 * this.length * 4);
      this.buf = new Float32Array(this.bufStorage, 0, 3 * this.length);
      for (i = _i = 0, _ref = this.length; _i < _ref; i = _i += 1) {
        this[i] = new Float32Array(this.bufStorage, i * 3 * 4, 3);
      }
    }

    Vector3Buffer.prototype.getBuffer = function() {
      return this.buf;
    };

    return Vector3Buffer;

  })(Array);

  THREE.terraingen.Point = (function() {
    function Point(x, y) {
      this.x = x != null ? x : 0.0;
      this.y = y != null ? y : 0.0;
    }

    Point.prototype.sub = function(p2) {
      return new Point(this.x - p2.x, this.y - p2.y);
    };

    Point.prototype.subSelf = function(p2) {
      this.x -= p2.x;
      this.y -= p2.y;
      return this;
    };

    Point.prototype.add = function(p2) {
      return new Point(this.x + p2.x, this.y + p2.y);
    };

    Point.prototype.addSelf = function(p2) {
      this.x += p2.x;
      this.y += p2.y;
      return this;
    };

    Point.prototype.copy = function(p2) {
      this.x = p2.x;
      this.y = p2.y;
      return this;
    };

    return Point;

  })();

  THREE.terraingen.AABB = (function() {
    function AABB(center, size) {
      var sHalf;
      this.center = center;
      this.size = size;
      sHalf = size / 2;
      this.min = new THREE.terraingen.Point(center.x - sHalf, center.y - sHalf);
      this.max = new THREE.terraingen.Point(center.x + sHalf, center.y + sHalf);
    }

    AABB.prototype.containsPoint = function(pt) {
      return pt.x >= this.min.x && pt.x <= this.max.x && pt.y >= this.min.y && pt.y <= this.max.y;
    };

    AABB.prototype.containsBox = function(box) {
      return this.min.x <= box.min.x && box.max.x <= this.max.x && this.min.y <= box.min.y && box.max.y <= this.max.y;
    };

    AABB.prototype.copy = function(box) {
      this.min.copy(box.min);
      this.max.copy(box.max);
      return this;
    };

    AABB.prototype.intersects = function(box) {
      if (box instanceof THREE.terraingen.Point) {
        return this.containsPoint(box);
      }
      return !(box.max.x < this.min.x || box.min.x > this.max.x || box.max.y < this.min.y || box.min.y > this.max.y);
    };

    return AABB;

  })();

  THREE.terraingen.QuadTreeBoundedItem = (function() {
    function QuadTreeBoundedItem(bounds, data) {
      this.bounds = bounds;
      this.data = data;
    }

    return QuadTreeBoundedItem;

  })();

  THREE.terraingen.QuadTreePointItem = (function() {
    function QuadTreePointItem(position, data) {
      this.position = position;
      this.data = data;
    }

    return QuadTreePointItem;

  })();

  THREE.terraingen.QuadTree = (function() {
    QuadTree.prototype.max_items = 4;

    function QuadTree(bounds) {
      this.bounds = bounds;
      this.nw = null;
      this.ne = null;
      this.se = null;
      this.sw = null;
      this.items = [];
      this.isLeaf = true;
    }

    QuadTree.prototype.addPointItem = function(item) {
      var child, _i, _len, _ref;
      if (!this.bounds.containsPoint(item.position)) {
        return false;
      }
      if (this.isLeaf) {
        this.items.push(item);
      } else {
        _ref = [this.nw, this.ne, this.se, this.sw];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child.bounds.containsPoint(item.position)) {
            child.addPointItem(item);
            return true;
          }
        }
      }
      if (this.items.length > this.max_items) {
        this.split();
      }
      return this;
    };

    QuadTree.prototype.draw = function(ctx) {
      var child, _i, _len, _ref, _results;
      ctx.rect(this.bounds.min.x, this.bounds.min.y, this.bounds.max.x, this.bounds.max.y);
      if (!this.isLeaf) {
        _ref = [this.nw, this.ne, this.se, this.sw];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _results.push(child.draw(ctx));
        }
        return _results;
      }
    };

    QuadTree.prototype.addItem = function(item) {
      var child, _i, _len, _ref;
      if (!this.bounds.containsBox(item.bounds)) {
        return false;
      }
      if (this.isLeaf) {
        this.items.push(item);
      } else {
        _ref = [this.nw, this.ne, this.se, this.sw];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child.bounds.intersects(item.bounds)) {
            child.addItem(item);
          }
        }
      }
      if (this.items.length > this.max_items) {
        this.split();
      }
      return true;
    };

    QuadTree.prototype.query = function(bounds) {
      var child, results, _i, _len, _ref;
      results = [];
      if (!this.bounds.intersects(bounds)) {
        return [];
      }
      if (this.isLeaf) {
        return this.items;
      }
      _ref = [this.nw, this.ne, this.se, this.sw];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        results = results.concat(child.query(bounds));
      }
      return result;
    };

    QuadTree.prototype.split = function() {
      var c, child, hb, item, qb, _i, _j, _len, _len1, _ref, _ref1;
      hb = this.bounds.size / 2;
      qb = hb / 2;
      c = this.bounds.center;
      this.nw = new QuadTree(new THREE.terraingen.AABB(new THREE.terraingen.Point(c.x - qb, c.y - qb), hb));
      this.ne = new QuadTree(new THREE.terraingen.AABB(new THREE.terraingen.Point(c.x + qb, c.y - qb), hb));
      this.se = new QuadTree(new THREE.terraingen.AABB(new THREE.terraingen.Point(c.x + qb, c.y + qb), hb));
      this.sw = new QuadTree(new THREE.terraingen.AABB(new THREE.terraingen.Point(c.x - qb, c.y + qb), hb));
      while (this.items.length) {
        item = this.items.pop();
        if (item instanceof THREE.terraingen.QuadTreePointItem) {
          _ref = [this.nw, this.ne, this.se, this.sw];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            child = _ref[_i];
            if (child.bounds.containsPoint(item.position)) {
              child.addPointItem(item);
            }
          }
        } else {
          _ref1 = [this.nw, this.ne, this.se, this.sw];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            child = _ref1[_j];
            if (child.bounds.intersects(item.bounds)) {
              child.addItem(item);
            }
          }
        }
      }
      return this.isLeaf = false;
    };

    return QuadTree;

  })();

  window.TerrainWorker = {
    ready: false,
    N: 624,
    FF: 0xFFFFFFFF,
    Seed: 48932432,
    varianceTree: [],
    getDataArrays: function(data) {
      var _w;
      this.maxVariance = data.variance;
      this.width = this.height = data.segments;
      _w = Math.abs(data.bounds.max.x - data.bounds.min.x);
      this.squareUnits = _w / data.segments;
      this.x = data.bounds.min.x;
      this.y = data.bounds.min.y;
      this.getVertices(data);
      this.getIndices(data);
      return data;
    },
    getIndices: function(data) {
      var tree;
      tree = this.buildTree(this.width, this.height, data);
      this.createIndexBuffer(data, tree);
      return data;
    },
    createIndexBuffer: function(data, tree) {
      var h, i, indices, jj, v1, v2, v3, w, _i, _ref;
      indices = new Uint16Array(this.indexCount * 6);
      w = (data.segments - 1) * this.squareUnits;
      h = (data.segments - 1) * this.squareUnits;
      jj = 0;
      for (i = _i = 0, _ref = tree.length; _i < _ref; i = _i += 1) {
        if (tree[i].lc == null) {
          v1 = tree[i].v1;
          v2 = tree[i].v2;
          v3 = tree[i].v3;
          indices[jj] = v1;
          indices[jj + 1] = v2;
          indices[jj + 2] = v3;
          jj += 3;
        }
      }
      return data.indices = indices;
    },
    getVertices: function(data) {
      var height, i, j, jj, stepX, stepY, width, x, y, _h, _i, _j, _w, _x, _y;
      x = data.bounds.min.x;
      y = data.bounds.min.y;
      width = height = data.segments;
      _w = data.bounds.max.x - data.bounds.min.x;
      _h = data.bounds.max.y - data.bounds.min.y;
      stepX = Math.abs(_w / data.segments);
      stepY = Math.abs(_h / data.segments);
      jj = 0;
      for (i = _i = 0; _i < width; i = _i += 1) {
        _x = x + (i * stepX);
        for (j = _j = 0; _j < height; j = _j += 1) {
          _y = y + (j * stepY);
          data.vertices.buf[jj] = i * stepX;
          data.vertices.buf[jj + 1] = this.getNoiseValue(_x, _y) * 1200;
          data.vertices.buf[jj + 2] = j * stepY;
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
    },
    newTri: function(v1, v2, v3) {
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
    },
    getVariance: function(v1, v2, v3, geom) {
      var alt, hi, hj, v, vh;
      if (Math.abs(geom.vertices[v3][0] - geom.vertices[v1][0]) > this.squareUnits || Math.abs(geom.vertices[v3][2] - geom.vertices[v1][2]) > this.squareUnits) {
        hi = Math.round(((geom.vertices[v3][0] / this.squareUnits) - (geom.vertices[v1][0] / this.squareUnits)) / 2 + (geom.vertices[v1][0] / this.squareUnits));
        hj = Math.round(((geom.vertices[v3][2] / this.squareUnits) - (geom.vertices[v1][2] / this.squareUnits)) / 2 + (geom.vertices[v1][2] / this.squareUnits));
        vh = Math.round(hi * this.width + hj);
        alt = geom.vertices[vh][1];
        v = Math.abs(alt - ((geom.vertices[v1][1] + geom.vertices[v3][1]) / 2));
        v = Math.max(v, this.getVariance(v2, vh, v1, geom));
        v = Math.max(v, this.getVariance(v3, vh, v2, geom));
      } else {
        v = 0;
      }
      return v;
    },
    buildTree: function(width, height, data) {
      this.tree = [];
      this.indexCount = 0;
      this.tree.push(this.newTri(0, width - 1, width + (width * (height - 1)) - 1));
      this.tree.push(this.newTri(width - 1 + (width * (height - 1)), width * (height - 1), 0));
      this.tree[0].bn = 1;
      this.tree[1].bn = 0;
      this.buildFace(0, data);
      this.buildFace(1, data);
      return this.tree;
    },
    buildFace: function(f, data) {
      var v1, v2, v3;
      if (this.tree[f].lc != null) {
        this.buildFace(this.tree[f].lc, data);
        this.buildFace(this.tree[f].rc, data);
      } else {
        v1 = this.tree[f].v1;
        v2 = this.tree[f].v2;
        v3 = this.tree[f].v3;
        if (this.getVariance(v1, v2, v3, data) > this.maxVariance) {
          this.splitFace(f, data);
          this.buildFace(this.tree[f].lc, data);
          this.buildFace(this.tree[f].rc, data);
        } else {
          this.indexCount++;
        }
      }
    },
    splitFace: function(f, data) {
      if (this.tree[f].bn != null) {
        if (this.tree[this.tree[f].bn].bn !== f) {
          this.splitFace(this.tree[f].bn, data);
        }
        this.splitFace2(f, data);
        this.splitFace2(this.tree[f].bn, data);
        this.tree[this.tree[f].lc].rn = this.tree[this.tree[f].bn].rc;
        this.tree[this.tree[f].rc].ln = this.tree[this.tree[f].bn].lc;
        this.tree[this.tree[this.tree[f].bn].lc].rn = this.tree[f].rc;
        this.tree[this.tree[this.tree[f].bn].rc].ln = this.tree[f].lc;
      } else {
        this.splitFace2(f, data);
      }
    },
    getApexIndex: function(v1, v2, v3) {},
    splitFace2: function(f, data) {
      var hi, hj, v1, v2, v3, vh;
      v1 = this.tree[f].v1;
      v2 = this.tree[f].v2;
      v3 = this.tree[f].v3;
      hi = ((data.vertices[v3][0] / this.squareUnits) - (data.vertices[v1][0] / this.squareUnits)) / 2 + (data.vertices[v1][0] / this.squareUnits);
      hj = ((data.vertices[v3][2] / this.squareUnits) - (data.vertices[v1][2] / this.squareUnits)) / 2 + (data.vertices[v1][2] / this.squareUnits);
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
    }
  };

}).call(this);
