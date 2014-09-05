(function() {
  var BTT, BTT_Array,
    __hasProp = {}.hasOwnProperty,
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

    BTTGeometryProvider.prototype.get = function() {
      this.btt = new BTT_Array(this.width, this.height, this.heightMapProvider);
      this.btt.createVertexBuffer();
      this.btt.buildTree(this.width, this.height);
      this.btt.createIndexBuffer();
      console.log(this.btt.geom);
      return this.btt.geom;
    };

    return BTTGeometryProvider;

  })(THREE.terraingen.GeometryProvider);

  BTT_Array = (function() {
    BTT_Array.prototype.tree = [];

    BTT_Array.prototype.maxVariance = 0.001;

    BTT_Array.prototype.squareUnits = 1;

    BTT_Array.prototype.heightScale = 1;

    function BTT_Array(width, height, heightMapProvider) {
      this.width = width;
      this.height = height;
      this.heightMapProvider = heightMapProvider;
      this.geom = new THREE.Geometry();
    }

    BTT_Array.prototype.createVertexBuffer = function() {
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

    BTT_Array.prototype.createIndexBuffer = function() {
      var i, v1, v2, v3, _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.tree.length; _i < _ref; i = _i += 1) {
        if (this.tree[i].lc == null) {
          v1 = this.tree[i].v1;
          v2 = this.tree[i].v2;
          v3 = this.tree[i].v3;
          _results.push(this.geom.faces.push(new THREE.Face3(v1, v2, v3)));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    BTT_Array.prototype.newTri = function(v1, v2, v3) {
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

    BTT_Array.prototype.getVariance = function(v1, v2, v3) {
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

    BTT_Array.prototype.buildTree = function(width, height) {
      this.tree.push(this.newTri(0, width - 1, width + (width * (height - 1)) - 1));
      this.tree.push(this.newTri(width - 1 + (width * (height - 1)), width * (height - 1), 0));
      this.tree[0].bn = 1;
      this.tree[1].bn = 0;
      this.buildFace(0);
      this.buildFace(1);
    };

    BTT_Array.prototype.buildFace = function(f) {
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

    BTT_Array.prototype.splitFace = function(f) {
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

    BTT_Array.prototype.getApexIndex = function(v1, v2, v3) {};

    BTT_Array.prototype.splitFace2 = function(f) {
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

    return BTT_Array;

  })();

  BTT = (function() {
    BTT.prototype.bn = null;

    BTT.prototype.ln = null;

    BTT.prototype.rn = null;

    BTT.prototype.lc = null;

    BTT.prototype.rc = null;

    BTT.prototype.depth = 0;

    BTT.prototype.has_children = false;

    function BTT(parent, depth) {
      this.parent = parent != null ? parent : null;
      this.depth = depth != null ? depth : 0;
    }

    BTT.prototype.split = function() {
      if (this.hasChildren) {
        return;
      }
      if (this.bn != null) {
        if (this.bn.bn !== this) {
          this.bn.split();
        }
        this.split2();
        this.bn.split2();
        this.lc.rn = this.bn.rc;
        this.rc.ln = this.bn.lc;
        this.bn.lc.rn = this.rc;
        this.bn.rc.ln = this.lc;
      } else {
        this.split2();
        this.lc.rn = null;
        this.rc.ln = null;
      }
    };

    BTT.prototype.split2 = function() {
      if (this.hasChildren) {
        return;
      }
      this.lc = new BTT(this, this.depth + 1);
      this.rc = new BTT(this, this.depth + 1);
      this.hasChildren = true;
      this.lc.ln = this.rc;
      this.rc.rn = this.lc;
      this.lc.bn = this.ln;
      if (this.ln != null) {
        if (this.ln.bn === this) {
          this.ln.bn = this.lc;
        } else {
          if (this.ln.ln === this) {
            this.ln.ln = this.lc;
          } else {
            this.ln.rn = this.lc;
          }
        }
      }
      this.rc.bn = this.rn;
      if (this.rn != null) {
        if (this.rn.bn === this) {
          this.rn.bn = this;
        } else {
          if (this.rn.rn === this) {
            this.rn.rn = this.rc;
          } else {
            this.rn.ln = this.rc;
          }
        }
      }
    };

    return BTT;

  })();

  THREE.terraingen.ROAMGeometryProvider = (function(_super) {
    __extends(ROAMGeometryProvider, _super);

    ROAMGeometryProvider.prototype.left_root = new BTT(null, 0);

    ROAMGeometryProvider.prototype.right_root = new BTT(null, 0);

    function ROAMGeometryProvider(x, y, width, height, max_variance) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.width = width != null ? width : 256;
      this.height = height != null ? height : 256;
      this.max_variance = max_variance != null ? max_variance : 0.01;
      this.left_root.bn = this.right_root;
      this.right_root.bn = this.left_root;
    }

    ROAMGeometryProvider.prototype._getVariance = function(apX, apY, lfX, lfY, rtX, rtY) {
      var avgHeight, cX, cY, heightA, heightB, realHeight;
      heightA = this.heightMapProvider.getHeightAt(lfX, lfY);
      heightB = this.heightMapProvider.getHeightAt(rtX, rtY);
      avgHeight = (heightA + heightB) * 0.5;
      cX = (lfX + rtX) >> 1;
      cY = (lfY + rtY) >> 1;
      realHeight = this.heightMapProvider.getHeightAt(cX, cY);
      return Math.abs(realHeight - avgHeight);
    };

    ROAMGeometryProvider.prototype._traverseVarianceIndex = function(apX, apY, lfX, lfY, rtX, rtY, depth, maxdepth) {
      var cX, cY, ret, v;
      v = this._getVariance(apX, apY, lfX, lfY, rtX, rtY);
      cX = (lfX + rtX) >> 1;
      cY = (lfY + rtY) >> 1;
      if (depth <= maxdepth) {
        v = Math.max(v, this._getVariance(cX, cY, apX, apY, lfX, lfY));
        v = Math.max(v, this._getVariance(cX, cY, rtX, rtY, apX, apY));
      }
      ret = v > this.max_variance ? "1" : "0";
      if (depth >= maxdepth && ret === "0") {
        return "0";
      }
      ret += this._traverseVarianceIndex(cX, cY, apX, apY, lfX, lfY, depth + 1, maxdepth);
      ret += this._traverseVarianceIndex(cX, cY, rtX, rtY, apX, apY, depth + 1, maxdepth);
      return ret;
    };

    ROAMGeometryProvider.prototype._buildVarianceIndex = function(lod) {
      var leftIndex, rightIndex;
      if (lod == null) {
        lod = 16;
      }
      leftIndex = this._traverseVarianceIndex(0, 0, 0, this.height, this.width, 0, 0, lod);
      rightIndex = this._traverseVarianceIndex(this.width, this.height, this.width, 0, 0, this.height, 0, lod);
      return rightIndex + leftIndex;
    };

    ROAMGeometryProvider.prototype.createTree = function(node, apX, apY, lfX, lfY, rtX, rtY, depth, maxdepth) {
      var cX, cY, split, v;
      v = this._getVariance(apX, apY, lfX, lfY, rtX, rtY);
      cX = (lfX + rtX) >> 1;
      cY = (lfY + rtY) >> 1;
      if (depth <= maxdepth) {
        v = Math.max(v, this._getVariance(cX, cY, apX, apY, lfX, lfY));
        v = Math.max(v, this._getVariance(cX, cY, rtX, rtY, apX, apY));
      }
      split = v > this.max_variance;
      if (split && depth <= maxdepth) {
        node.split();
      } else {
        return;
      }
      if (node.hasChildren) {
        this.createTree(node.lc, cX, cY, apX, apY, lfX, lfY, depth + 1, maxdepth);
        this.createTree(node.rc, cX, cY, rtX, rtY, apX, apY, depth + 1, maxdepth);
      }
    };

    ROAMGeometryProvider.prototype.createGeom = function(node, apX, apY, lfX, lfY, rtX, rtY) {
      var apHeight, cX, cY, ind, lfHeight, rtHeight;
      if (node.hasChildren) {
        cX = (lfX + rtX) >> 1;
        cY = (lfY + rtY) >> 1;
        this.createGeom(node.lc, cX, cY, apX, apY, lfX, lfY);
        return this.createGeom(node.rc, cX, cY, rtX, rtY, apX, apY);
      } else {
        ind = this.geometry.vertices.length - 1;
        apHeight = this.heightMapProvider.getHeightAt(apX, apY);
        lfHeight = this.heightMapProvider.getHeightAt(lfX, lfY);
        rtHeight = this.heightMapProvider.getHeightAt(rtX, rtY);
        this.geometry.vertices.push(new THREE.Vector3(apX, apHeight, apY));
        this.geometry.vertices.push(new THREE.Vector3(lfX, lfHeight, lfY));
        this.geometry.vertices.push(new THREE.Vector3(rtX, rtHeight, rtY));
        return this.geometry.faces.push(new THREE.Face3(ind + 1, ind + 2, ind + 3));
      }
    };

    ROAMGeometryProvider.prototype._buildSplits = function(lod) {
      if (lod == null) {
        lod = 12;
      }
      this.createTree(this.left_root, 0, 0, 0, this.height, this.width, 0, 0, lod);
      return this.createTree(this.right_root, this.width, this.height, this.width, 0, 0, this.height, 0, lod);
    };

    ROAMGeometryProvider.prototype._buildGeometry = function() {
      this.geometry = new THREE.Geometry();
      this.createGeom(this.left_root, 0, 0, 0, this.height, this.width, 0);
      return this.createGeom(this.right_root, this.width, this.height, this.width, 0, 0, this.height, 0);
    };

    ROAMGeometryProvider.prototype.get = function() {
      console.log(this._buildVarianceIndex());
      this._buildSplits();
      this._buildGeometry();
      return this.geometry;
    };

    return ROAMGeometryProvider;

  })(THREE.terraingen.GeometryProvider);

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
