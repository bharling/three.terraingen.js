(function() {
  var THREE, floor, pow, sqrt,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  THREE = window.THREE || {};

  THREE.terraingen = THREE.terraingen || {};

  THREE.terraingen.filters = THREE.terraingen.filters || {};

  THREE.terraingen.features = THREE.terraingen.features || {};

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

  pow = Math.pow, sqrt = Math.sqrt, floor = Math.floor;

  THREE.terraingen.features.Road = (function() {
    function Road(start, end, width) {
      this.start = start;
      this.end = end;
      this.width = width != null ? width : 2;
    }

    return Road;

  })();

  ({
    getClosestPointToLine: function(A, B, P) {
      var a_to_b, a_to_p, atb2, atp_dot_atb, t;
      a_to_p = [P[0] - A[0], P[1] - A[1]];
      a_to_b = [B[0] - A[0], B[1] - A[1]];
      atb2 = pow(a_to_b[0], 2) + pow(a_to_b[1], 2);
      atp_dot_atb = a_to_p[0] * a_to_b[0] + a_to_p[1] * a_to_b[1];
      t = atp_dot_atb / atb2;
      return [A.x + a_to_b[0] * t, A.y + a_to_b[1] * t];
    },
    distance2d: function(A, B) {
      var xs, ys;
      xs = B[0] - A[0];
      ys = B[1] - A[1];
      return sqrt(xs * xs, ys * ys);
    }
  });

  THREE.terraingen.features.Feature = (function() {
    function Feature() {}

    return Feature;

  })();

  THREE.terraingen.features.Roads = (function(_super) {
    __extends(Roads, _super);

    function Roads(roads) {
      this.roads = roads;
      this.filterPoint = __bind(this.filterPoint, this);
    }

    Roads.prototype.filterPoint = function(pos, heightMapProvider) {
      var point_on_road, r, road_height, _i, _len, _ref;
      _ref = this.roads;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        r = _ref[_i];
        point_on_road = getClosestPointToLine(r.start, r.end, pos);
        if (distance2d(pos, point_on_road) <= r.width) {
          road_height = heightMapProvider.getHeightAt(point_on_road[0], point_on_road[1]);
          return road_height;
        }
      }
      return heightMapProvider.getHeightAt(pos[0], pos[1]);
    };

    return Roads;

  })(THREE.terraingen.features.Feature);

  THREE.terraingen.filters.Cliffs = (function(_super) {
    __extends(Cliffs, _super);

    function Cliffs(plainLevel, range) {
      this.plainLevel = plainLevel != null ? plainLevel : 0.5;
      this.range = range != null ? range : 0.2;
      this.apply = __bind(this.apply, this);
      this.halfRange = this.range / 2;
      this.lowerBound = this.plainLevel - this.halfRange;
      this.upperBound = this.plainLevel + this.halfRange;
    }

    Cliffs.prototype.apply = function(val) {
      if ((this.lowerBound < val && val < this.upperBound)) {
        return this.plainLevel;
      }
      return val;
    };

    return Cliffs;

  })(THREE.terraingen.filters.Filter);

}).call(this);
