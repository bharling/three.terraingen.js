(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  THREE.terraingen.GeometryProvider = (function() {
    GeometryProvider.prototype.geometry = null;

    GeometryProvider.prototype.heightMapProvider = null;

    function GeometryProvider(x, y, width, height) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.width = width != null ? width : 256;
      this.height = height != null ? height : 256;
    }

    GeometryProvider.prototype.get = function() {
      return new THREE.BufferGeometry;
    };

    return GeometryProvider;

  })();

  THREE.terraingen.BTTGeometryProvider = (function(_super) {
    __extends(BTTGeometryProvider, _super);

    function BTTGeometryProvider(x, y, width, height) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.width = width != null ? width : 257;
      this.height = height != null ? height : 257;
    }

    BTTGeometryProvider.prototype.get = function(maxVariance) {
      if (maxVariance == null) {
        maxVariance = 0.05;
      }
      this.btt = new THREE.terraingen.BTT(this.width, this.height, this.heightMapProvider, maxVariance);
      this.btt.createVertexBuffer();
      this.btt.buildTree(this.width, this.height);
      this.btt.createIndexBuffer();
      return this.btt.geom;
    };

    return BTTGeometryProvider;

  })(THREE.terraingen.GeometryProvider);

  THREE.terraingen.BTT = (function() {
    BTT.prototype.tree = [];

    BTT.prototype.maxVariance = 0.02;

    BTT.prototype.squareUnits = 1;

    BTT.prototype.heightScale = 1;

    function BTT(width, height, heightMapProvider, maxVariance) {
      this.width = width;
      this.height = height;
      this.heightMapProvider = heightMapProvider;
      this.maxVariance = maxVariance;
      this.geom = new THREE.Geometry();
    }

    BTT.prototype.createVertexBuffer = function() {
      var alt, i, j, nv, _i, _j, _ref, _ref1;
      nv = 0;
      for (i = _i = 0, _ref = this.width; _i < _ref; i = _i += 1) {
        for (j = _j = 0, _ref1 = this.height; _j < _ref1; j = _j += 1) {
          alt = (this.heightMapProvider.getHeightAt(i, j)) * this.heightScale;
          this.geom.vertices.push(new THREE.Vector3(i * this.squareUnits, alt, j * this.squareUnits));
          nv++;
        }
      }
      return console.log(this.geom.vertices.length);
    };

    BTT.prototype.createIndexBuffer = function() {
      var i, v1, v2, v3, _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.tree.length; _i < _ref; i = _i += 1) {
        if (this.tree[i].lc == null) {
          v1 = this.tree[i].v1;
          v2 = this.tree[i].v2;
          v3 = this.tree[i].v3;
          _results.push(this.geom.faces.push(new THREE.Face3(v3, v2, v1)));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
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

    BTT.prototype.getVariance = function(v1, v2, v3) {
      var alt, hi, hj, v, vh;
      if (Math.abs(this.geom.vertices[v3].x - this.geom.vertices[v1].x) > this.squareUnits || Math.abs(this.geom.vertices[v3].z - this.geom.vertices[v1].z) > this.squareUnits) {
        hi = Math.round(((this.geom.vertices[v3].x / this.squareUnits) - (this.geom.vertices[v1].x / this.squareUnits)) / 2 + (this.geom.vertices[v1].x / this.squareUnits));
        hj = Math.round(((this.geom.vertices[v3].z / this.squareUnits) - (this.geom.vertices[v1].z / this.squareUnits)) / 2 + (this.geom.vertices[v1].z / this.squareUnits));
        vh = Math.round(hi * this.width + hj);
        alt = this.heightMapProvider.getHeightAt(hi, hj);
        v = Math.abs(alt - ((this.geom.vertices[v1].y + this.geom.vertices[v3].y) / 2));
        v = Math.max(v, this.getVariance(v2, vh, v1));
        v = Math.max(v, this.getVariance(v3, vh, v2));
      } else {
        v = 0;
      }
      return v;
    };

    BTT.prototype.buildTree = function(width, height) {
      this.tree.push(this.newTri(0, width - 1, width + (width * (height - 1)) - 1));
      this.tree.push(this.newTri(width - 1 + (width * (height - 1)), width * (height - 1), 0));
      this.tree[0].bn = 1;
      this.tree[1].bn = 0;
      this.buildFace(0);
      this.buildFace(1);
    };

    BTT.prototype.buildFace = function(f) {
      var v1, v2, v3;
      if (this.tree[f].lc != null) {
        this.buildFace(this.tree[f].lc);
        this.buildFace(this.tree[f].rc);
      } else {
        v1 = this.tree[f].v1;
        v2 = this.tree[f].v2;
        v3 = this.tree[f].v3;
        if (this.getVariance(v1, v2, v3) > this.maxVariance) {
          this.splitFace(f);
          this.buildFace(this.tree[f].lc);
          this.buildFace(this.tree[f].rc);
        }
      }
    };

    BTT.prototype.splitFace = function(f) {
      if (this.tree[f].bn != null) {
        if (this.tree[this.tree[f].bn].bn !== f) {
          this.splitFace(this.tree[f].bn);
        }
        this.splitFace2(f);
        this.splitFace2(this.tree[f].bn);
        this.tree[this.tree[f].lc].rn = this.tree[this.tree[f].bn].rc;
        this.tree[this.tree[f].rc].ln = this.tree[this.tree[f].bn].lc;
        this.tree[this.tree[this.tree[f].bn].lc].rn = this.tree[f].rc;
        this.tree[this.tree[this.tree[f].bn].rc].ln = this.tree[f].lc;
      } else {
        this.splitFace2(f);
      }
    };

    BTT.prototype.getApexIndex = function(v1, v2, v3) {};

    BTT.prototype.splitFace2 = function(f) {
      var hi, hj, v1, v2, v3, vh;
      v1 = this.tree[f].v1;
      v2 = this.tree[f].v2;
      v3 = this.tree[f].v3;
      hi = ((this.geom.vertices[v3].x / this.squareUnits) - (this.geom.vertices[v1].x / this.squareUnits)) / 2 + (this.geom.vertices[v1].x / this.squareUnits);
      hj = ((this.geom.vertices[v3].z / this.squareUnits) - (this.geom.vertices[v1].z / this.squareUnits)) / 2 + (this.geom.vertices[v1].z / this.squareUnits);
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
        y = iz * segment_height - height_half;
        for (ix = _j = 0; _j < gridX1; ix = _j += 1) {
          x = ix * segment_width - width_half;
          hgt = this.heightMapProvider.getHeightAt(x, y);
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
            face = new THREE.Face3(b, c, d);
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

}).call(this);
