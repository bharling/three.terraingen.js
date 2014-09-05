(function() {
  var THREE,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  THREE = window.THREE || {};

  THREE.terraingen = THREE.terraingen || {};

  THREE.terraingen.filters = THREE.terraingen.filters || {};

  THREE.terraingen.filters.Filter = (function() {
    function Filter() {
      this.apply = __bind(this.apply, this);
    }

    Filter.prototype.apply = function(val) {
      return val;
    };

    return Filter;

  })();

  THREE.terraingen.filters.LowPass = (function(_super) {
    __extends(LowPass, _super);

    function LowPass(cutoff) {
      this.cutoff = cutoff != null ? cutoff : 1.0;
      this.apply = __bind(this.apply, this);
    }

    LowPass.prototype.apply = function(val) {
      return Math.max(val, this.cutoff);
    };

    return LowPass;

  })(THREE.terraingen.filters.Filter);

  THREE.terraingen.filters.HighPass = (function(_super) {
    __extends(HighPass, _super);

    function HighPass(cutoff) {
      this.cutoff = cutoff != null ? cutoff : 1.0;
      this.apply = __bind(this.apply, this);
    }

    HighPass.prototype.apply = function(val) {
      return Math.min(val, this.cutoff);
    };

    return HighPass;

  })(THREE.terraingen.filters.Filter);

}).call(this);
