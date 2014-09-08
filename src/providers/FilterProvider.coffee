THREE = window.THREE or {}

THREE.terraingen = THREE.terraingen || {}

THREE.terraingen.filters = THREE.terraingen.filters || {}

THREE.terraingen.features = THREE.terraingen.features || {}


class THREE.terraingen.filters.Filter
  constructor: () ->
    
  apply: (val) =>
    return val
    
class THREE.terraingen.filters.LowPass extends THREE.terraingen.filters.Filter
  constructor: (@cutoff=1.0) ->
  
  apply:(val) =>
    Math.max val, @cutoff
      
class THREE.terraingen.filters.HighPass extends THREE.terraingen.filters.Filter
  constructor: (@cutoff=1.0) ->
    
  apply:(val) =>
    Math.min val, @cutoff
    
{pow, sqrt, floor} = Math


class THREE.terraingen.features.Road
  constructor: (@start, @end, @width=2) ->

getClosestPointToLine: (A, B, P) ->
  a_to_p = [P[0] - A[0], P[1] - A[1]]
  a_to_b = [B[0] - A[0], B[1] - A[1]]
  atb2 = pow(a_to_b[0],2) + pow(a_to_b[1],2)
  atp_dot_atb = a_to_p[0]*a_to_b[0] + a_to_p[1]*a_to_b[1]
  t = atp_dot_atb / atb2
  return [ A.x + a_to_b[0]*t, A.y + a_to_b[1]*t]
  
distance2d: (A, B) ->
  xs = B[0] - A[0]
  ys = B[1] - A[1]
  return sqrt( xs*xs, ys*ys )
  
  
class THREE.terraingen.features.Feature
  constructor: () ->
  
class THREE.terraingen.features.Roads extends THREE.terraingen.features.Feature
  constructor: (@roads) ->
    
    
  filterPoint: (pos, heightMapProvider) =>
    for r in @roads
      point_on_road = getClosestPointToLine(r.start, r.end, pos)
      if distance2d(pos, point_on_road) <= r.width
        road_height = heightMapProvider.getHeightAt(point_on_road[0], point_on_road[1])
        return road_height
    return heightMapProvider.getHeightAt(pos[0], pos[1])
  
  
  
    
class THREE.terraingen.filters.Cliffs extends THREE.terraingen.filters.Filter
  constructor: (@plainLevel=0.5, @range=0.2) ->
    @halfRange = @range / 2
    @lowerBound = @plainLevel - @halfRange
    @upperBound = @plainLevel + @halfRange
    
  apply:(val) =>
    if @lowerBound < val < @upperBound
      #diff = @plainLevel - val
      #dist = 1.0 - Math.abs(diff / @halfRange)
      return @plainLevel # + (diff*dist)
    return val
    
