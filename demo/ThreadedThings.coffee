window.NoiseGenerator =
  ready : false
  N : 624
  FF : 0xFFFFFFFF
  Seed : 48932432
  
  
  grad3: [
    [1,1, 0], [-1,1, 0], [1,-1,0], [-1,-1,0], [1,0, 1], [-1, 0, 1]
    [1,0,-1], [-1,0,-1], [0, 1,1], [ 0,-1,1], [0,1,-1], [ 0,-1,-1]
  ]
 
  # A lookup table to traverse the simplex around a given point in 4D.
  # Details can be found where this table is used, in the 4D noise method.
  simplex: [
    [0,1,2,3], [0,1,3,2], [0,0,0,0], [0,2,3,1], [0,0,0,0], [0,0,0,0]
    [0,0,0,0], [1,2,3,0], [0,2,1,3], [0,0,0,0], [0,3,1,2], [0,3,2,1]
    [0,0,0,0], [0,0,0,0], [0,0,0,0], [1,3,2,0], [0,0,0,0], [0,0,0,0]
    [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]
    [1,2,0,3], [0,0,0,0], [1,3,0,2], [0,0,0,0], [0,0,0,0], [0,0,0,0]
    [2,3,0,1], [2,3,1,0], [1,0,2,3], [1,0,3,2], [0,0,0,0], [0,0,0,0]
    [0,0,0,0], [2,0,3,1], [0,0,0,0], [2,1,3,0], [0,0,0,0], [0,0,0,0]
    [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]
    [2,0,1,3], [0,0,0,0], [0,0,0,0], [0,0,0,0], [3,0,1,2], [3,0,2,1]
    [0,0,0,0], [3,1,2,0], [2,1,0,3], [0,0,0,0], [0,0,0,0], [0,0,0,0]
    [3,1,0,2], [0,0,0,0], [3,2,0,1], [3,2,1,0]
  ]
  
  initRandom : (seed) ->
    @mt = []
    @index = 0
    @mt[0] = seed
    for i in [1...@N]
      s = (@mt[i-1] ^ (@mt[i-1] >>> 30))
      @mt[i] = ((((((s & 0xffff0000) >>> 16) * 0x6C078965) << 16) + (s & 0xffff) * 0x6C078965) + i) >>> 0
    @ready=true
      
  initMap: ->
    @p = (Math.floor(@rand() * 256) for i in [0...256])
    @perm = (@p[i & 255] for i in [0...512])
    
  next : ->
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
    
  rand : ->
    @next() * (1.0 / 4294967295.0)
    
  dot: (g, x, y) ->
    g[0] * x + g[1] * y
    
    
  getRegion: (data) ->
    s = parseInt data.seed

    @initRandom s
    @initMap()
    
    if !@p
      @initMap()
    x = data.x
    y = data.y
    rx = data.x
    ry = data.y
    width = data.width
    height = data.height
    octaves = data.octaves
    scale = data.scale
    result = []
    for i in [0 ... width] by 1
      _x = x + i
      for j in [0 ... height] by 1
        _y = y + j
        result.push @getNoiseValue( _x, _y, 0.0, octaves, scale )
    cfg = x : rx, y : ry
    results: result, data : cfg
    
  getNoiseValue: (x, y, z=0.0, octaves=8, scale=1.0) ->
    hgt = 0.0
    amplitude = 1.0
    x*=scale
    y*=scale
    for o in [1 ... octaves] by 1
      hgt += (@getHeightAt x, y) * amplitude
      x *= 2.0
      y *= 2.0
      amplitude *= 0.5
    #@cache[key] = hgt
    hgt
 
  getHeightAt: (xin, yin) ->
    # Skew the input space to determine which simplex cell we're in
    F2 = 0.5*(Math.sqrt(3.0)-1.0)
    s = (xin+yin)*F2 # Hairy factor for 2D
    i = Math.floor(xin+s)
    j = Math.floor(yin+s)
    G2 = (3.0-Math.sqrt(3.0))/6.0
    t = (i+j)*G2
 
    # Unskew the cell origin back to (x,y) space
    X0 = i-t
    Y0 = j-t
 
    # The x,y distances from the cell origin
    x0 = xin-X0
    y0 = yin-Y0
 
    # For the 2D case, the simplex shape is an equilateral triangle.
    # Determine which simplex we are in.
    # Offsets for second (middle) corner of simplex in (i,j) coords
    if x0 > y0
      # lower triangle, XY order: (0,0)->(1,0)->(1,1)
      i1=1
      j1=0
    else
      # upper triangle, YX order: (0,0)->(0,1)->(1,1)
      i1=0
      j1=1
    # A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
    # a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
    # c = (3-sqrt(3))/6
    x1 = x0 - i1 + G2 # Offsets for middle corner in (x,y) unskewed coords
    y1 = y0 - j1 + G2
    x2 = x0 - 1.0 + 2.0 * G2 # Offsets for last corner in (x,y) unskewed coords
    y2 = y0 - 1.0 + 2.0 * G2
    # Work out the hashed gradient indices of the three simplex corners
    ii = i & 255
    jj = j & 255
    gi0 = @perm[ii+@perm[jj]] % 12
    gi1 = @perm[ii+i1+@perm[jj+j1]] % 12
    gi2 = @perm[ii+1+@perm[jj+1]] % 12
    # Calculate the contribution from the three corners
    t0 = 0.5 - x0*x0-y0*y0
    if t0 < 0
      n0 = 0.0
    else
      t0 *= t0
      n0 = t0 * t0 * @dot(@grad3[gi0], x0, y0)  # (x,y) of grad3 used for 2D gradient
    t1 = 0.5 - x1*x1-y1*y1
    if t1 < 0
      n1 = 0.0
    else
      t1 *= t1
      n1 = t1 * t1 * @dot(@grad3[gi1], x1, y1)
    t2 = 0.5 - x2*x2-y2*y2
    if t2 < 0
      n2 = 0.0
    else
      t2 *= t2
      n2 = t2 * t2 * @dot(@grad3[gi2], x2, y2)
    # Add contributions from each corner to get the final noise value.
    # The result is scaled to return values in the interval [-1,1].
    70.0 * (n0 + n1 + n2)
    
    
    
    
