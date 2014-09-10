(function() {
  var THREE;

  THREE = window.THREE || {};

  THREE.terraingen = THREE.terraingen || {};

  THREE.terraingen.MeshProvider = (function() {
    MeshProvider.prototype.geometryProvider = null;

    MeshProvider.prototype.materialProvider = null;

    MeshProvider.prototype.lod = 0.0001;

    function MeshProvider(x, y, width, height) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.width = width != null ? width : 257;
      this.height = height != null ? height : 257;
    }

    MeshProvider.prototype.setRegion = function(x, y, width, height) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.width = width != null ? width : 257;
      this.height = height != null ? height : 257;
    };

    MeshProvider.prototype.build = function() {
      var geom, material, mesh;
      this.geometryProvider.setRegion(this.x, this.y, this.width, this.height);
      geom = this.geometryProvider.get(this.lod);
      geom.computeFaceNormals();
      geom.computeVertexNormals(true);
      geom = new THREE.BufferGeometry().fromGeometry(geom);
      material = new THREE.MeshNormalMaterial({
        shading: THREE.SmoothShading,
        wireframe: true
      });
      return mesh = new THREE.Mesh(geom, material);
    };

    MeshProvider.prototype.get = function() {
      return this.build();
    };

    return MeshProvider;

  })();

}).call(this);
