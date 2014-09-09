(function() {
  var THREE, abs, max, min, pow,
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

  max = Math.max, min = Math.min, abs = Math.abs, pow = Math.pow;

  THREE.terraingen.modifiers.Constant = (function(_super) {
    __extends(Constant, _super);

    function Constant(value) {
      this.value = value;
    }

    Constant.prototype.get = function(x, y, z) {
      if (z == null) {
        z = 0.0;
      }
      return this.value;
    };

    return Constant;

  })(THREE.terraingen.modifiers.Modifier);

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

  THREE.terraingen.modifiers.Multiply = (function(_super) {
    __extends(Multiply, _super);

    function Multiply(source1, source2) {
      this.source1 = source1;
      this.source2 = source2;
    }

    Multiply.prototype.get = function(x, y, z) {
      if (z == null) {
        z = 0.0;
      }
      return this.source1.get(x, y) * this.source2.get(x, y);
    };

    return Multiply;

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

  THREE.terraingen.modifiers.Abs = (function(_super) {
    __extends(Abs, _super);

    function Abs(source) {
      this.source = source;
    }

    Abs.prototype.get = function(x, y, z) {
      if (z == null) {
        z = 0.0;
      }
      return abs(this.source.get(x, y, z));
    };

    return Abs;

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

  THREE.terraingen.modifiers.Pow = (function(_super) {
    __extends(Pow, _super);

    function Pow(source1, source2) {
      this.source1 = source1;
      this.source2 = source2;
    }

    Pow.prototype.get = function(x, y, z) {
      var val;
      if (z == null) {
        z = 0.0;
      }
      val = (1.0 + this.source1.get(x, y, z)) * 0.5;
      val = pow(val, this.source2.get(x, y, z));
      return (val * 2.0) - 1.0;
    };

    return Pow;

  })(THREE.terraingen.modifiers.Modifier);

  THREE.terraingen.modifiers.Mix = (function(_super) {
    __extends(Mix, _super);

    function Mix(source1, source2, control) {
      this.source1 = source1;
      this.source2 = source2;
      this.control = control;
    }

    Mix.prototype.get = function(x, y, z) {
      var mix, val1, val2;
      if (z == null) {
        z = 0.0;
      }
      val1 = this.source1.get(x, y, z);
      val2 = this.source2.get(x, y, z);
      mix = (1.0 + this.control.get(x, y, z)) * 0.5;
      return (val1 * mix) + (val2 * (1.0 - mix));
    };

    return Mix;

  })(THREE.terraingen.modifiers.Modifier);

  THREE.terraingen.modifiers.Cache = (function(_super) {
    __extends(Cache, _super);

    Cache.prototype.cache = {};

    Cache.prototype.cache_misses = 0;

    Cache.prototype.cache_hits = 0;

    function Cache(source) {
      this.source = source;
    }

    Cache.prototype.get = function(x, y, z) {
      var key;
      if (z == null) {
        z = 0.0;
      }
      key = '' + x + '_' + y + '_' + z;
      if (this.cache[key] == null) {
        this.cache[key] = this.source.get(x, y, z);
      }
      return this.cache[key];
    };

    return Cache;

  })(THREE.terraingen.modifiers.Modifier);

}).call(this);
