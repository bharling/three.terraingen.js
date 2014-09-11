(function() {
  var QuadTreeNode, calculateCameraRect, getCameraTarget;

  getCameraTarget = function(camera) {
    var l;
    l = new THREE.Vector3(0, 0, -100);
    camera.updateMatrixWorld();
    l.applyMatrix4(camera.matrixWorld);
    return l;
  };

  calculateCameraRect = function(camera) {
    var d, dTmp, fc, ftl, ftr, hFar, hNear, l, maxX, maxY, minX, minY, nc, ntl, ntr, p, r, rTmp, u, uTmp, wFar, wNear;
    hNear = 2 * Math.tan(camera.fov / 2) * camera.near;
    wNear = hNear * camera.aspect;
    hFar = 2 * Math.tan(camera.fov / 2) * camera.far;
    wFar = hFar * camera.aspect;
    p = camera.position.clone();
    l = getCameraTarget(camera);
    u = new THREE.Vector3(0.0, 1.0, 0.0);
    d = new THREE.Vector3();
    d.subVectors(l, p);
    d.normalize();
    r = new THREE.Vector3();
    r.crossVectors(u, d);
    r.normalize();
    dTmp = d.clone();
    nc = new THREE.Vector3();
    nc.addVectors(p, dTmp.multiplyScalar(camera.near));
    uTmp = u.clone();
    rTmp = r.clone();
    ntr = new THREE.Vector3();
    ntr.addVectors(nc, uTmp.multiplyScalar(hNear / 2));
    ntr.sub(rTmp.multiplyScalar(wNear / 2));
    uTmp.copy(u);
    rTmp.copy(r);
    ntl = new THREE.Vector3();
    ntl.addVectors(nc, uTmp.multiplyScalar(hNear / 2));
    ntl.add(rTmp.multiplyScalar(wNear / 2));
    dTmp.copy(d);
    fc = new THREE.Vector3();
    fc.addVectors(p, dTmp.multiplyScalar(camera.far));
    uTmp.copy(u);
    rTmp.copy(r);
    ftr = new THREE.Vector3();
    ftr.addVectors(fc, uTmp.multiplyScalar(hFar / 2));
    ftr.sub(rTmp.multiplyScalar(wFar / 2));
    uTmp.copy(u);
    rTmp.copy(r);
    ftl = new THREE.Vector3();
    ftl.addVectors(fc, uTmp.multiplyScalar(hFar / 2));
    ftl.add(rTmp.multiplyScalar(wFar / 2));
    minX = Math.min(ntr.x, ntl.x, ftr.x, ftl.x);
    minY = Math.min(ntr.z, ntl.z, ftr.z, ftl.z);
    maxX = Math.max(ntr.x, ntl.x, ftr.x, ftl.x);
    maxY = Math.max(ntr.z, ntl.z, ftr.z, ftl.z);
    return [minX, minY, maxX, maxY];
  };

  THREE.terraingen.Patch = (function() {
    Patch.prototype.parent = null;

    function Patch(x, y, width, height, meshProvider, parent) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.width = width != null ? width : 33;
      this.height = height != null ? height : 33;
      this.meshProvider = meshProvider;
      this.parent = parent != null ? parent : null;
      this.object = new THREE.LOD();
      this.meshProvider.setRegion(this.x, this.y, this.width, this.height);
      this.object.position.x = this.x;
      this.object.position.z = this.y;
      this.ready = this.building = false;
      this.distance = Infinity;
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
    Tile.prototype.lods = [
      {
        level: 0.005,
        distance: 200
      }, {
        level: 0.02,
        distance: 400
      }, {
        level: 0.06,
        distance: 800
      }
    ];

    function Tile(x, y, meshProvider) {
      var i, j, patch, _i, _j;
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.meshProvider = meshProvider;
      this.queue = [];
      this.patches = [];
      this.object = new THREE.Object3D();
      this.ready = false;
      this.doLOD = true;
      for (i = _i = 0; _i < 16; i = _i += 1) {
        for (j = _j = 0; _j < 16; j = _j += 1) {
          patch = new THREE.terraingen.Patch(this.x + (i * 32), this.y + (j * 32), 33, 33, this.meshProvider, this);
          this.queue.push(patch);
        }
      }
    }

    Tile.prototype.build = function() {
      var lod, next, _i, _len, _ref;
      if (!this.ready) {
        if (this.queue.length) {
          next = this.queue.pop();
          _ref = this.lods;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            lod = _ref[_i];
            next.addLOD(lod.level, lod.distance);
          }
          this.patches.push(next);
          return this.object.add(next.get());
        } else {
          return this.ready = true;
        }
      }
    };

    Tile.prototype.buildPatch = function(patch) {
      var lod, _i, _len, _ref;
      _ref = this.lods;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        lod = _ref[_i];
        patch.addLOD(lod.level, lod.distance);
      }
      patch.ready = true;
      return this.object.add(patch.get());
    };

    Tile.prototype.addCompletedPatch = function(patch) {
      this.patches.push(patch);
      return this.object.add(patch.object);
    };

    Tile.prototype.update = function(camera, frustum) {
      var contains, not_to_build, p, to_build, _i, _j, _len, _len1, _ref, _ref1;
      to_build = [];
      if (!this.ready) {
        not_to_build = [];
        _ref = this.queue;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          p = _ref[_i];
          contains = frustum.containsPoint(p.object.position);
          if (contains) {
            to_build.push(p);
          } else {
            not_to_build.push(p);
          }
        }
        this.queue = not_to_build;
        if (this.queue.length === 0) {
          this.ready = true;
        }
      }
      if (this.doLOD) {
        _ref1 = this.patches;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          p = _ref1[_j];
          contains = frustum.containsPoint(p.object.position);
          if (contains) {
            p.object.update(camera);
          }
          p.object.visible = contains;
        }
      }
      return to_build;
    };

    Tile.prototype.get = function() {
      return this.object;
    };

    return Tile;

  })();

  THREE.terraingen.TileManager = (function() {
    TileManager.prototype.lods = [
      {
        level: 0.002,
        distance: 200
      }, {
        level: 0.007,
        distance: 600
      }, {
        level: 0.04,
        distance: 1200
      }
    ];

    function TileManager(meshProvider, scene) {
      var i, j, obj, tile, _i, _j;
      this.meshProvider = meshProvider;
      this.scene = scene;
      this.tiles = [];
      this.queue = [];
      this.currentTile = null;
      this.frustum = new THREE.Frustum();
      this.cameraRect = [];
      for (i = _i = -2; _i < 2; i = ++_i) {
        for (j = _j = -2; _j < 2; j = ++_j) {
          tile = new THREE.terraingen.Tile(i * 512, j * 512, this.meshProvider);
          obj = tile.get();
          obj.scale.y = 150;
          this.scene.add(obj);
          this.tiles.push(tile);
        }
      }
    }

    TileManager.prototype.buildPatch = function(patch) {
      var lod, _i, _len, _ref;
      _ref = this.lods;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        lod = _ref[_i];
        patch.addLOD(lod.level, lod.distance);
      }
      return patch.parent.addCompletedPatch(patch);
    };

    TileManager.prototype.update = function(camera) {
      var b, tile, to_build, _i, _j, _len, _len1, _ref;
      this.cameraRect = calculateCameraRect(camera);
      console.log(this.cameraRect);
      if (this.queue.length) {
        this.buildPatch(this.queue.pop());
      }
      this.frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
      _ref = this.tiles;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tile = _ref[_i];
        to_build = tile.update(camera, this.frustum);
        for (_j = 0, _len1 = to_build.length; _j < _len1; _j++) {
          b = to_build[_j];
          b.distance = camera.position.distanceToSquared(b.object.position);
          this.queue.push(b);
        }
      }
    };

    return TileManager;

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

}).call(this);
