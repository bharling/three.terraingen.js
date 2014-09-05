THREE = window.THREE or {}

THREE.terraingen = THREE.terraingen || {}

THREE.terraingen.filters = THREE.terraingen.filters || {}


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
    
class THREE.terraingen.filters.Cliffs extends THREE.terraingen.filters.Filter
  constructor: (@plainLevel=0.5, @range=0.2) ->
    @lowerBound = @plainLevel - (@range / 2)
    @upperBound = @plainLevel + (@range / 2)
    
  apply:(val) =>
    if @lowerBound < val < @upperBound
      return @plainLevel
    return val
    
