{sqrt, floor, abs} = Math


window.TerrainWorker =
  ready : false
  N : 624
  FF : 0xFFFFFFFF
  Seed : 48932432
  varianceTree: []
    
  getVertices: (data) ->
    # we expect data to contain a Float32Array called vertices of the correct length
    #@initRandom parseInt( data.seed )
    #@initMap()
    
    x = data.bounds.min.x
    y = data.bounds.min.y
    width = height = data.segments + 1
    octaves = data.octaves
    scale = data.scale
    result = data.vertices
    
    _w = data.bounds.max.x - data.bounds.min.x
    _h = data.bounds.max.y - data.bounds.min.y
    
    stepX = Math.abs(_w / data.segments)
    stepY = Math.abs(_h / data.segments)
    
    
    
    jj = 0
    for i in [0 ... height] by 1
      _y = y + (i*stepY)
      for j in [0 ... width] by 1
        _x = x + (j*stepX)
        
        data.vertices[jj] = (j*stepY)
        
        data.vertices[jj+1] = @getNoiseValue( _x, _y, 0.0, octaves, scale ) * 500.0;
        
        data.vertices[jj+2] = (i*stepX)
        
        
        
        jj+=3
    data
    
    
  getRegion: (data) ->
    @initRandom parseInt( data.seed )
    @initMap()
    x = data.x
    y = data.y
    rx = data.x
    ry = data.y
    width = data.width
    height = data.height
    octaves = data.octaves
    scale = data.scale
    result = data.container
    jj = 0
    for i in [0 ... width] by 1
      _x = x + i
      for j in [0 ... height] by 1
        _y = y + j
        result[jj] = @getNoiseValue( _x, _y, 0.0, octaves, scale )
        jj++
    cfg = x : rx, y : ry
    data
    
  getNoiseValue: (x, y, z=0.0, octaves=8, scale=1.0) ->
    return @noiseGenerator.get(x, y)
    
  getVariance: (v1, v2, v3, vertices) ->
    if Math.abs( vertices[v3] - vertices[v1] ) > @squareUnits or Math.abs(vertices[v3+2] - vertices[v1+2]) > @squareUnits
      hi = Math.round(((vertices[v3] / @squareUnits) - (vertices[v1] / @squareUnits)) / 2 + (vertices[v1] / @squareUnits))
      hj = Math.round(((vertices[v3+2] / @squareUnits) - (vertices[v1+2] / @squareUnits)) / 2 + (geom.vertices[v1+2] / @squareUnits))
      
      
      
      vh = Math.round((hi)*(@width) + hj) * 3
      
      alt = vertices[hi+1] #@heightMapProvider.get @x+hi, @y+hj
      v = Math.abs(alt - ((vertices[v1+1] + vertices[v3+1]) / 2))
      v = Math.max(v, @getVariance(v2, vh, v1, vertices))
      v = Math.max(v, @getVariance(v3, vh, v2, vertices))
    else
      v = 0
    return v
    
    
