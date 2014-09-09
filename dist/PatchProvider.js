(function() {
  var QuadTreeNode;

  THREE.terraingen.TerrainPatch = (function() {
    TerrainPatch.prototype.parent = null;

    TerrainPatch.prototype.object = new THREE.LOD();

    function TerrainPatch(x, y, width, height, meshProvider, parent) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.width = width != null ? width : 257;
      this.height = height != null ? height : 257;
      this.meshProvider = meshProvider;
      this.parent = parent != null ? parent : null;
      this.meshProvider.setRegion(this.x, this.y, this.width, this.height);
    }

    TerrainPatch.prototype.addLOD = function(level, distance) {
      var obj;
      this.meshProvider.lod = level;
      obj = this.meshProvider.get();
      return this.object.addLevel(obj, distance);
    };

    TerrainPatch.prototype.get = function() {
      return this.object;
    };

    return TerrainPatch;

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
