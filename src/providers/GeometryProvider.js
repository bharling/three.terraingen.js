(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  THREE.terraingen.GeometryProvider = (function() {
    GeometryProvider.prototype.geometry = null;

    GeometryProvider.prototype.heightMapProvider = null;

    function GeometryProvider(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }

    GeometryProvider.prototype.get = function() {
      return new THREE.BufferGeometry;
    };

    return GeometryProvider;

  })();

  THREE.terraingen.GridGeometryProvider = (function(_super) {
    __extends(GridGeometryProvider, _super);

    function GridGeometryProvider() {
      _ref = GridGeometryProvider.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    GridGeometryProvider.prototype._build = function() {
      var chunkSize, i, indices, num_faces, positions, x, y, _i, _j, _k, _ref1, _ref2, _ref3;
      this.geometry = new THREE.BufferGeometry;
      num_faces = width * height * 2;
      indices = new Uint16Array(num_faces * 3);
      chunkSize = 21845;
      for (i = _i = 0, _ref1 = indices.length; _i < _ref1; i = _i += 1) {
        indices[i] = i % (3 * chunkSize);
      }
      positions = new Float32Array(num_faces * 3 * 3);
      i = 0;
      for (x = _j = 0, _ref2 = this.width - 1; _j < _ref2; x = _j += 1) {
        for (y = _k = 0, _ref3 = this.height - 1; _k < _ref3; y = _k += 1) {
          positions[i] = x;
          positions[i + 1] = this.heightMapProvider.getHeightAt(x, y);
          positions[i + 2] = y;
          positions[i + 3] = x + 1;
          positions[i + 4] = this.heightMapProvider.getHeightAt(x + 1, y);
          positions[i + 5] = y;
          positions[i + 6] = x + 1;
          positions[i + 7] = this.heightMapProvider.getHeightAt(x + 1, y + 1);
          positions[i + 8] = y + 1;
          positions[i + 9] = x;
          positions[i + 10] = this.heightMapProvider.getHeightAt(x, y + 1);
          positions[i + 11] = y + 1;
          i += 12;
        }
      }
      this.geometry.addAttribute('index', new THREE.BufferAttribute(indices, 1));
      return this.geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    };

    GridGeometryProvider.prototype.get = function() {
      this._build();
      return this.geometry;
    };

    return GridGeometryProvider;

  })(THREE.terraingen.GeometryProvider);

}).call(this);
