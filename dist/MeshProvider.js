(function() {
  var THREE;

  THREE = window.THREE || {};

  THREE.terraingen = THREE.terraingen || {};

  THREE.terraingen.MeshProvider = (function() {
    MeshProvider.prototype.geometryProvider = null;

    MeshProvider.prototype.materialProvider = null;

    MeshProvider.prototype.mesh = null;

    function MeshProvider(x, y, width, height) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.width = width != null ? width : 256;
      this.height = height != null ? height : 256;
    }

    MeshProvider.prototype.build = function() {
      var geom, material;
      geom = this.geometryProvider.get(0.001);
      geom.computeFaceNormals();
      geom.computeVertexNormals(true);
      material = new THREE.MeshNormalMaterial({
        shading: THREE.SmoothShading,
        wireframe: true
      });
      return this.mesh = new THREE.Mesh(geom, material);
    };

    MeshProvider.prototype.get = function() {
      this.build();
      return this.mesh;
    };

    return MeshProvider;

  })();

}).call(this);
