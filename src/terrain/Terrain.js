(function() {
  window.tgen || (window.tgen = {});

  tgen.TriTreeNode = (function() {
    function TriTreeNode() {
      this.me = 0;
      this.leftNeighbour = 0;
      this.rightNeighbour = 0;
      this.baseNeighbour = 0;
      this.leftChild = 0;
      this.rightChild = 0;
      this.variance = 0;
    }

    TriTreeNode.prototype.isLeaf = function() {
      if (this.me === 0) {
        return false;
      }
      if (this.leftChild === 0 && this.rightChild === 0) {
        return false;
      }
      return true;
    };

    return TriTreeNode;

  })();

  tgen.Landscape = (function() {
    Landscape.prototype.maxTris = 25000;

    Landscape.prototype.MAP_SIZE = 128;

    Landscape.prototype.NUM_PATCHES_PER_SIDE = 32;

    Landscape.prototype.PATCH_SIZE = Landscape.MAP_SIZE / Landscape.NUM_PATCHES_PER_SIDE;

    function Landscape() {
      var i;
      this.allocatedTris = 0;
      this.nodeList = (function() {
        var _i, _ref, _results;
        _results = [];
        for (i = _i = 0, _ref = this.maxTris; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          _results.push(new tgen.TriTreeNode());
        }
        return _results;
      }).call(this);
    }

    Landscape.prototype.setHeightMapProvider = function(heightMapProvider) {
      this.heightMapProvider = heightMapProvider;
    };

    Landscape.prototype.getHeight = function(x, y, z) {
      if (z == null) {
        z = 0.0;
      }
      return this.heightMapProvider.get(x, y, z);
    };

    return Landscape;

  })();

  tgen.Patch = (function() {
    function Patch(land) {
      this.land = land;
    }

    Patch.prototype.init = function(worldX, worldY) {
      this.worldX = worldX;
      this.worldY = worldY;
      this.baseLeft = this.land.getNextNode();
      this.baseRight = this.land.getNextNode();
      return this.reset();
    };

    Patch.prototype.reset = function() {
      this.baseLeft.leftChild = this.baseLeft.rightChild = this.baseRight.leftChild = this.baseRight.rightChild = 0;
      this.baseLeft.leftNeighbour = this.baseLeft.rightNeighbour = this.baseRight.leftNeighbour = this.baseRight.rightNeighbour = 0;
      this.baseLeft.baseNeighbour = this.baseRight.me;
      return this.baseRight.baseNeighbour = this.baseLeft.me;
    };

    Patch.prototype.tessellate = function() {
      this.buildTriangle(this.baseLeft, this.worldX, this.worldY + this.land.PATCH_SIZE, this.worldX + this.land.PATCH_SIZE, this.worldY, this.worldX, this.worldY);
      return this.buildTriangle(this.baseRight, this.worldX + this.land.PATCH_SIZE, this.worldY, this.worldX, this.worldY + this.land.PATCH_SIZE, this.worldX + this.land.PATCH_SIZE, this.worldY + this.land.PATCH_SIZE);
    };

    Patch.prototype.split = function(tri) {
      var lc, rc;
      if (!tri.isLeaf()) {
        return;
      }
      if (tri.baseNeighbour !== 0 && (this.land.nodes[tri.baseNeighbour].baseNeighbour !== tri.me)) {
        this.split(land.nodes[tri.baseNeighbour]);
      }
      tri.leftChild = this.land.getNextNode();
      tri.rightChild = this.land.getNextNode();
      lc = this.land.nodes[tri.leftChild];
      return rc = this.land.nodes[tri.rightChild];
    };

    return Patch;

  })();

}).call(this);
