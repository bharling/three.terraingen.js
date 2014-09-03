

THREE = window.THREE or {}

THREE.terraingen = THREE.terraingen || {}


class THREE.terraingen.RNGProvider
  constructor: () ->
    @init()
    
  init : (@seed) ->
    
    
  random: () ->
    
class THREE.terraingen.BasicRandomProvider extends THREE.terraingen.RNGProvider
  random:() ->
    return Math.random()
  
  
  
class THREE.terraingen.MersenneTwisterProvider extends THREE.terraingen.RNGProvider
  init: (@seed) ->
    @seed ?= new Date().getTime();
    
    @N = 624
    @M = 39
    @MATRIX_A = 0x9908b0df
    @UPPER_MASK = 0x80000000
    @LOWER_MASK = 0x7fffffff
    
    @mt = new Array @N
    @mti = @N+1
    
    @init_genrand @seed
    
  random: () ->
    return @genrand_real1()
    
  init_genrand: (s) ->
    @mt[0] = s >>> 0
    
    @mti = 1
    while @mti <= @N
      s = @mt[@mti-1] ^ (@mt[@mti-1] >>> 30)
      @mt[@mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253) + @mti
      @mt[@mti] >>>= 0
      @mti++
      
   genrand_int31: () ->
     @genrand_int32() >>> 1
     
   genrand_real1: () ->
     @genrand_int32()*(1.0/4294967295.0)
     
   
      
   genrand_int32: () ->
     mag01 = new Array 0x0, @MATRIX_A
     
     if @mti >= @N
       kk = 0
       if @mti == @N+1
         @init_genrand 5489
       
       while kk < @N-@M
         y = (@mt[kk]&@UPPER_MASK)|(@mt[kk+1]&@LOWER_MASK)
         @mt[kk] = @mt[kk+@M] ^ (y >>> 1) ^ mag01[y & 0x1]
         kk++
       
       while kk < @N-1
         y = (@mt[kk]&@UPPER_MASK)|(@mt[kk+1]&@LOWER_MASK)
         @mt[kk] = @mt[kk+(@M-@N)] ^ (y >>> 1) ^ mag01[y & 0x1]
         kk++
         
       y = (@mt[@N-1]&@UPPER_MASK)|(@mt[0]&@LOWER_MASK)
       @mt[@N-1] = @mt[@M-1] ^ (y >>> 1) ^ mag01[y & 0x1]
       @mti = 0
     y = this.mt[this.mti++]

     y ^= (y >>> 11)
     y ^= (y << 7) & 0x9d2c5680
     y ^= (y << 15) & 0xefc60000
     y ^= (y >>> 18)
   
     return y >>> 0
    
