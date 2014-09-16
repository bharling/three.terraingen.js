THREE = window.THREE or {}

THREE.terraingen = THREE.terraingen || {}

THREE.terraingen.modifiers = THREE.terraingen.modifiers || {}




class THREE.terraingen.modifiers.Modifier
  constructor: () ->
    
  get: (x, y, z=0.0) ->
    return 1.0


{max, min, abs, pow} = Math


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
    return Math.abs @source.get(x,y,z)
    
class THREE.terraingen.modifiers.Max extends THREE.terraingen.modifiers.Modifier
  constructor: (@source1, @source2) ->
    
  get: (x, y, z=0.0) ->
    return Math.max @source1.get(x,y,z), @source2.get(x,y,z)
    
class THREE.terraingen.modifiers.Min extends THREE.terraingen.modifiers.Modifier
  constructor: (@source1, @source2) ->
    
  get: (x, y, z=0.0) ->
    return Math.min @source1.get(x,y,z), @source2.get(x,y,z)
    
    
class THREE.terraingen.modifiers.Pow extends THREE.terraingen.modifiers.Modifier
  constructor: (@source1, @source2) ->
    
  get: (x, y, z=0.0) ->
    val = ( 1.0 + @source1.get(x,y,z) ) * 0.5
    val = Math.pow val, @source2.get(x,y,z)
    return (val*2.0) - 1.0
    
    
class THREE.terraingen.modifiers.Mix extends THREE.terraingen.modifiers.Modifier
  constructor: (@source1, @source2, @control) ->
    
  get: (x,y,z=0.0) ->
    val1 = @source1.get(x,y,z)
    val2 = @source2.get(x,y,z)
    mix = (1.0 + @control.get(x,y,z)) * 0.5
    return (val1 * mix) + (val2 * (1.0-mix))
    
    
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
    
    
  
    
