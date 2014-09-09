(function() {
  var THREE, max, min,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  THREE = window.THREE || {};

  THREE.terraingen = THREE.terraingen || {};

  THREE.terraingen.modifiers = THREE.terraingen.modifiers || {};

  THREE.terraingen.modifiers.Modifier = (function() {
    function Modifier() {}

    Modifier.prototype.get = function(x, y, z) {
      if (z == null) {
        z = 0.0;
      }
      return 1.0;
    };

    return Modifier;

  })();

  max = Math.max, min = Math.min;

  THREE.terraingen.modifiers.Add = (function(_super) {
    __extends(Add, _super);

    function Add(source1, source2) {
      this.source1 = source1;
      this.source2 = source2;
    }

    Add.prototype.get = function(x, y, z) {
      if (z == null) {
        z = 0.0;
      }
      return this.source1.get(x, y) + this.source2.get(x, y);
    };

    return Add;

  })(THREE.terraingen.modifiers.Modifier);

  THREE.terraingen.modifiers.Subtract = (function(_super) {
    __extends(Subtract, _super);

    function Subtract(source1, source2) {
      this.source1 = source1;
      this.source2 = source2;
    }

    Subtract.prototype.get = function(x, y, z) {
      if (z == null) {
        z = 0.0;
      }
      return this.source1.get(x, y) - this.source2.get(x, y);
    };

    return Subtract;

  })(THREE.terraingen.modifiers.Modifier);

  THREE.terraingen.modifiers.ConvertToUnsigned = (function(_super) {
    __extends(ConvertToUnsigned, _super);

    function ConvertToUnsigned(source) {
      this.source = source;
    }

    ConvertToUnsigned.prototype.get = function(x, y, z) {
      if (z == null) {
        z = 0.0;
      }
      return (1.0 + this.source.get(x, y, z)) * 0.5;
    };

    return ConvertToUnsigned;

  })(THREE.terraingen.modifiers.Modifier);

  THREE.terraingen.modifiers.Invert = (function(_super) {
    __extends(Invert, _super);

    function Invert(source) {
      this.source = source;
    }

    Invert.prototype.get = function(x, y, z) {
      if (z == null) {
        z = 0.0;
      }
      return this.source.get(x, y, z) * -1;
    };

    return Invert;

  })(THREE.terraingen.modifiers.Modifier);

  THREE.terraingen.modifiers.Max = (function(_super) {
    __extends(Max, _super);

    function Max(source1, source2) {
      this.source1 = source1;
      this.source2 = source2;
    }

    Max.prototype.get = function(x, y, z) {
      if (z == null) {
        z = 0.0;
      }
      return max(this.source1.get(x, y, z), this.source2.get(x, y, z));
    };

    return Max;

  })(THREE.terraingen.modifiers.Modifier);

  THREE.terraingen.modifiers.Min = (function(_super) {
    __extends(Min, _super);

    function Min(source1, source2) {
      this.source1 = source1;
      this.source2 = source2;
    }

    Min.prototype.get = function(x, y, z) {
      if (z == null) {
        z = 0.0;
      }
      return min(this.source1.get(x, y, z), this.source2.get(x, y, z));
    };

    return Min;

  })(THREE.terraingen.modifiers.Modifier);

  THREE.terraingen.modifiers.Cache = (function(_super) {
    __extends(Cache, _super);

    Cache.prototype.needs_update = true;

    Cache.prototype.cache = [];

    function Cache(source, x, y, width, height) {
      this.source = source;
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.width = width != null ? width : 257;
      this.height = height != null ? height : 257;
    }

    Cache.prototype.cacheMap = function() {
      var i, j, _i, _j, _ref, _ref1;
      this.cache = [];
      for (i = _i = 0, _ref = this.width; _i < _ref; i = _i += 1) {
        for (j = _j = 0, _ref1 = this.height; _j < _ref1; j = _j += 1) {
          this.heightCache.push(this.source.get(this.y + j, this.x + i));
        }
      }
      return this.needs_update = false;
    };

    Cache.prototype.get = function(x, y, z) {
      if (z == null) {
        z = 0.0;
      }
      if (this.needs_update) {
        this.cacheMap();
      }
      return this.cache[(x - this.x) + this.width * (y - this.y)];
    };

    return Cache;

  })(THREE.terraingen.modifiers.Modifier);

}).call(this);
