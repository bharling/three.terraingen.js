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
