THREE = window.THREE or {}

THREE.terraingen = THREE.terraingen || {}

THREE.terraingen.modifiers = THREE.terraingen.modifiers || {}




class THREE.terraingen.modifiers.Modifier
  constructor: () ->
    
  get: (x, y, z=0.0) ->
    return 1.0


{max, min, abs} = Math


class THREE.terraingen.modifiers.Constant extends THREE.terraingen.modifiers.Modifier
  constructor: (@value) ->
    
  get: (x, y, z=0.0) ->
    return @value
    

class THREE.terraingen.modifiers.Add extends THREE.terraingen.modifiers.Modifier
  constructor: (@source1, @source2) ->
    
  get: (x, y, z=0.0) ->
    return @source1.get(x,y) + @source2.get(x,y)
    
class THREE.terraingen.modifiers.Subtract extends THREE.terraingen.modifiers.Modifier
  constructor: (@source1, @source2) ->
    
  get: (x, y, z=0.0) ->
    return @source1.get(x,y) - @source2.get(x,y)
    
class THREE.terraingen.modifiers.Multiply extends THREE.terraingen.modifiers.Modifier
  constructor: (@source1, @source2) ->
    
  get: (x, y, z=0.0) ->
    return @source1.get(x,y) * @source2.get(x,y)
    
    
class THREE.terraingen.modifiers.ConvertToUnsigned extends THREE.terraingen.modifiers.Modifier
  constructor: (@source) ->
    
  get: (x, y, z=0.0) ->
    return (1.0 + @source.get(x, y, z)) * 0.5
    
class THREE.terraingen.modifiers.Invert extends THREE.terraingen.modifiers.Modifier
  constructor: (@source) ->
    
  get: (x, y, z=0.0) ->
    return @source.get(x,y,z) * -1
    
class THREE.terraingen.modifiers.Abs extends THREE.terraingen.modifiers.Modifier
  constructor: (@source) ->
    
  get: (x, y, z=0.0) ->
    return abs @source.get(x,y,z)
    
class THREE.terraingen.modifiers.Max extends THREE.terraingen.modifiers.Modifier
  constructor: (@source1, @source2) ->
    
  get: (x, y, z=0.0) ->
    return max @source1.get(x,y,z), @source2.get(x,y,z)
    
class THREE.terraingen.modifiers.Min extends THREE.terraingen.modifiers.Modifier
  constructor: (@source1, @source2) ->
    
  get: (x, y, z=0.0) ->
    return min @source1.get(x,y,z), @source2.get(x,y,z)
    
    
class THREE.terraingen.modifiers.Cache extends THREE.terraingen.modifiers.Modifier
  cache: {}
  cache_misses: 0
  cache_hits: 0
  
  constructor: (@source) ->
    
  get : (x, y, z=0.0) ->
    key = '' + x + '_' + y + '_' + z
    if !@cache[key]?
      @cache[key] = @source.get(x, y, z)
    return @cache[key]
    
    
  
    
