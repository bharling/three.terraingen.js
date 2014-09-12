(function() {
  var THREE;

  THREE = window.THREE || {};

  THREE.terraingen = THREE.terraingen || {};

  THREE.terraingen.MeshProvider = (function() {
    MeshProvider.prototype.geometryProvider = null;

    MeshProvider.prototype.materialProvider = null;

    MeshProvider.prototype.lod = 0.0001;

    function MeshProvider(geometryProvider) {
      this.geometryProvider = geometryProvider;
    }

    MeshProvider.prototype.setRegion = function(x, y, width, height) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.width = width != null ? width : 257;
      this.height = height != null ? height : 257;
    };

    MeshProvider.prototype.setBounds = function(bounds) {
      this.width = this.height = bounds.hs * 2;
      this.x = bounds.c.x - bounds.hs;
      return this.y = bounds.c.y - bounds.hs;
    };

    MeshProvider.prototype.setLOD = function(lod) {
      this.lod = lod;
    };

    MeshProvider.prototype.build = function() {
      var geom, material, mesh;
      this.geometryProvider.setRegion(this.x, this.y, this.width, this.height);
      geom = this.geometryProvider.get(this.lod);
      geom.computeFaceNormals();
      geom.computeVertexNormals(true);
      geom.mergeVertices();
      geom = new THREE.BufferGeometry().fromGeometry(geom);
      material = new THREE.MeshBasicMaterial({
        shading: THREE.SmoothShading,
        wireframe: true
      });
      return mesh = new THREE.Line(geom, material);
    };

    MeshProvider.prototype.get = function() {
      return this.build();
    };

    return MeshProvider;

  })();

}).call(this);
