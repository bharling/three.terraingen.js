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
    
