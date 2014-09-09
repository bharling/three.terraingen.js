(function() {
  var QuadTreeNode;

  THREE.terraingen.Patch = (function() {
    Patch.prototype.parent = null;

    Patch.prototype.object = new THREE.LOD();

    function Patch(x, y, width, height, meshProvider, parent) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.width = width != null ? width : 33;
      this.height = height != null ? height : 33;
      this.meshProvider = meshProvider;
      this.parent = parent != null ? parent : null;
      this.meshProvider.setRegion(this.x, this.y, this.width, this.height);
    }

    Patch.prototype.addLOD = function(level, distance) {
      var obj;
      this.meshProvider.lod = level;
      this.meshProvider.setRegion(this.x, this.y, this.width, this.height);
      obj = this.meshProvider.get();
      return this.object.addLevel(obj, distance);
    };

    Patch.prototype.get = function() {
      return this.object;
    };

    return Patch;

  })();

  THREE.terraingen.Tile = (function() {
    Tile.prototype.queue = [];

    Tile.prototype.patches = [];

    Tile.prototype.ready = false;

    Tile.prototype.object = new THREE.Object3d();

    Tile.prototype.lods = [
      {
        level: 0.002,
        distance: 100
      }, {
        level: 0.02,
        distance: 300
      }, {
        level: 0.1,
        distance: 600
      }
    ];

    function Tile(x, y, meshProvider) {
      var i, j, patch, _i, _j;
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.meshProvider = meshProvider;
      for (i = _i = 0; _i < 16; i = _i += 1) {
        for (j = _j = 0; _j < 16; j = _j += 1) {
          patch = new THREE.terraingen.Patch(i * 33, j * 33, 33, 33, this.meshProvider);
          this.patches.push(patch);
          this.queue.push(patch);
        }
      }
    }

    Tile.prototype.update = function() {
      var next;
      if (!this.ready) {
        if (this.queue.length) {
          return next = this.queue.pop();
        }
      }
    };

    return Tile;

  })();

  QuadTreeNode = (function() {
    QuadTreeNode.prototype.maxobjects = 8;

    function QuadTreeNode(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.children = null;
      this.objects = [];
    }

    QuadTreeNode.prototype.add = function(object) {
      var hh, hw, node, obj, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results;
      if (this.objects) {
        this.objects.push(object);
        if (this.objects.length > this.maxobjects) {
          hw = this.width * 0.5;
          hh = this.height * 0.5;
          this.children = [new QuadTreeNode(this.x, this.y, hw, hh), new QuadTreeNode(this.x + hw, this.y, hw, hh), new QuadTreeNode(this.x, this.y + hh, hw, hh), new QuadTreeNode(this.x + hw, this.y + hh, hw, hh)];
          _ref = this.objects;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            obj = _ref[_i];
            _ref1 = this.children;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              node = _ref1[_j];
              if (node.contains(obj)) {
                node.add(obj);
              }
            }
          }
          return this.objects = null;
        } else {
          _ref2 = this.children;
          _results = [];
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            node = _ref2[_k];
            if (node.contains(object)) {
              _results.push(node.add(object));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      }
    };

    return QuadTreeNode;

  })();

  THREE.terraingen.PatchManager = (function() {
    function PatchManager() {}

    return PatchManager;

  })();

}).call(this);
