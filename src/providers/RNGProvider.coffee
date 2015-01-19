


class THREE.terraingen.RNGProvider
  constructor: (seed) ->
      
  random: () =>
    
class THREE.terraingen.BasicRandomProvider extends THREE.terraingen.RNGProvider
  random:() =>
    return Math.random()
  
  
  
# Thanks to https://gist.github.com/300494
class THREE.terraingen.MersenneTwisterProvider extends THREE.terraingen.RNGProvider
  N: 624
  FF: 0xFFFFFFFF
    
  constructor: (seed) ->
    @mt = []
    @index = 0
    
    @mt[0] = seed ?= new Date().getTime()
    
    for i in [1...@N]
      s = (@mt[i-1] ^ (@mt[i-1] >>> 30))
      @mt[i] = ((((((s & 0xffff0000) >>> 16) * 0x6C078965) << 16) + (s & 0xffff) * 0x6C078965) + i) >>> 0
      
  random: () =>
    @next()*(1.0/4294967295.0)
  
  
  next: ->
    @twist() if @index == 0
    
    y = @mt[@index]
    y = y ^ (y >>> 11)
    y = (y ^ ((y << 7) & 0x9D2C5680)) & @FF
    y = (y ^ ((y << 15) & 0xEFC60000)) & @FF
    y = y ^ (y >>> 18)
    
    @index = (@index + 1) % @N
    
    y >>> 0
  
  
  twist: ->
    for i in [0...@N]
      y = (@mt[i] & 0x80000000) | (@mt[(i+1) % @N] & 0x7FFFFFFF)
      @mt[i] = (@mt[(i+397) % @N] ^ (y >>> 1)) >>> 0
      
      if (y & 1) != 0
        @mt[i] = (@mt[i] ^ 0x9908B0DF) >>> 0
    null
      
    