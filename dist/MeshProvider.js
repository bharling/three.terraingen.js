(function() {
  var THREE;

  THREE = window.THREE || {};

  THREE.terraingen = THREE.terraingen || {};

  THREE.terraingen.MeshProvider = (function() {
    function MeshProvider(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }

    MeshProvider.prototype.build = function(heightMapProvider) {
      this.heightMapProvider = heightMapProvider;
    };

    MeshProvider.prototype.get_geometry = function() {};

    return MeshProvider;

  })();

}).call(this);
