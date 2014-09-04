(function() {
  var THREE, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  THREE = window.THREE || {};

  THREE.terraingen = THREE.terraingen || {};

  THREE.terraingen.MeshProvider = (function() {
    function MeshProvider(x, y, width, height) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.width = width != null ? width : 256;
      this.height = height != null ? height : 256;
    }

    MeshProvider.prototype.build = function(heightMapProvider) {
      this.heightMapProvider = heightMapProvider;
    };

    MeshProvider.prototype.get_geometry = function() {
      return new THREE.Geometry();
    };

    return MeshProvider;

  })();

  THREE.terraingen.GridMeshProvider = (function(_super) {
    __extends(GridMeshProvider, _super);

    function GridMeshProvider() {
      _ref = GridMeshProvider.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    GridMeshProvider.prototype.get_geometry = function() {
      var faces, hgt, verts, x, x_world, y, y_world, _i, _ref1, _results;
      verts = [];
      faces = [];
      _results = [];
      for (x = _i = 0, _ref1 = this.width; _i < _ref1; x = _i += 1) {
        _results.push((function() {
          var _j, _ref2, _results1;
          _results1 = [];
          for (y = _j = 0, _ref2 = this.height; _j < _ref2; y = _j += 1) {
            x_world = this.x + x;
            y_world = this.y + y;
            _results1.push(hgt = this.heightMapProvider.getHeightAt(x, y));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    return GridMeshProvider;

  })(THREE.terraingen.MeshProvider);

}).call(this);
