{sqrt, floor, abs} = Math

window.THREE or= {}

THREE.terraingen or= {}

class THREE.Vector3Buffer extends Array
  constructor: (@length) ->
    @bufStorage = new ArrayBuffer 3 * @length * 4
    @buf = new Float32Array @bufStorage, 0, 3 * @length
    for i in [0 ... @length] by 1
      @[i] = new Float32Array @bufStorage, i * 3 * 4, 3
    
  getBuffer: ()  ->
    @buf
    
    
class THREE.terraingen.Point
  constructor: ( @x=0.0, @y=0.0 ) ->
    
  sub: (p2) ->
    new Point @x - p2.x, @y - p2.y
    
  subSelf: (p2) ->
    @x -= p2.x
    @y -= p2.y
    @
    
  add: (p2) ->
    new Point @x + p2.x, @y + p2.y
    
  addSelf: (p2) ->
    @x += p2.x
    @y += p2.y
    @
    
  copy: (p2) ->
    @x = p2.x
    @y = p2.y
    @
    
    
class THREE.terraingen.AABB
  constructor: (@center, @size) ->
    sHalf = size / 2
    @min = new THREE.terraingen.Point center.x - sHalf, center.y - sHalf
    @max = new THREE.terraingen.Point center.x + sHalf, center.y + sHalf
    
  containsPoint: (pt) ->
    pt.x >= @min.x and pt.x <= @max.x and pt.y >= @min.y and pt.y <= @max.y
    
  containsBox: (box) ->
    @min.x <= box.min.x and box.max.x <= @max.x and @min.y <= box.min.y and box.max.y <= @max.y
    
  copy: (box) ->
    @min.copy box.min
    @max.copy box.max
    @
    
    
  intersects: (box) ->
    if box instanceof THREE.terraingen.Point
      return @containsPoint box
    not (box.max.x < @min.x or box.min.x > @max.x or box.max.y < @min.y or box.min.y > @max.y)
    
    
class THREE.terraingen.QuadTreeBoundedItem
  constructor:(@bounds, @data) ->
    
class THREE.terraingen.QuadTreePointItem
  constructor:(@position, @data) ->

class THREE.terraingen.QuadTree
  max_items : 4
  
  constructor: (@bounds) ->
    @nw = null
    @ne = null
    @se = null
    @sw = null
    @items = []
    @isLeaf = true
    
    
  addPointItem: (item) ->
    if not @bounds.containsPoint item.position
      return false
      
    if @isLeaf
      @items.push item
    else
      for child in [@nw, @ne, @se, @sw]
        if child.bounds.containsPoint item.position
          child.addPointItem item
          return true
    if @items.length > @max_items
      @split()
    @
          
    
  draw: (ctx) ->
    

    #ctx.beginPath()
    #ctx.strokeStyle="red"
    #ctx.fillStyle = "black"
    #ctx.lineWidth="2"
    ctx.rect @bounds.min.x, @bounds.min.y, @bounds.max.x, @bounds.max.y
    
    #if @isLeaf
    #  for p in @items
    #    if p instanceof THREE.terraingen.QuadTreePointItem
    #      ctx.fillStyle = 'yellow'
    #      ctx.beginPath()
    #      ctx.rect p.position.x-3, p.position.y-3, 6, 6
    #      ctx.fill()
    #else
    if not @isLeaf
      for child in [@nw, @ne, @se, @sw]
        child.draw ctx
    
    
  addItem:(item) ->
    if not @bounds.containsBox item.bounds
      return false
      
    if @isLeaf
      @items.push item
    else
      for child in [@nw, @ne, @se, @sw]
        if child.bounds.intersects item.bounds
          child.addItem item
    
    if @items.length > @max_items
      @split()
      
    return true
      
  query: (bounds) ->
    results = []
    if not @bounds.intersects bounds
      return []
      
    if @isLeaf
      return @items
      
    for child in [@nw, @ne, @se, @sw]
      results = results.concat child.query( bounds )
      
    return result
      
    
      
  split: ->
    hb = @bounds.size / 2
    qb = hb / 2
    c = @bounds.center
    @nw = new QuadTree( new THREE.terraingen.AABB( new THREE.terraingen.Point( c.x - qb, c.y - qb ), hb  ) )
    @ne = new QuadTree( new THREE.terraingen.AABB( new THREE.terraingen.Point( c.x + qb, c.y - qb ), hb  ) )
    @se = new QuadTree( new THREE.terraingen.AABB( new THREE.terraingen.Point( c.x + qb, c.y + qb ), hb  ) )
    @sw = new QuadTree( new THREE.terraingen.AABB( new THREE.terraingen.Point( c.x - qb, c.y + qb ), hb  ) )
    
    while @items.length
      item = @items.pop()
      if item instanceof THREE.terraingen.QuadTreePointItem
        for child in [@nw, @ne, @se, @sw]
          if child.bounds.containsPoint item.position
            child.addPointItem item
      else
        for child in [@nw, @ne, @se, @sw]
          if child.bounds.intersects item.bounds
            child.addItem item
    @isLeaf = false
      
    
  


window.TerrainWorker =
  ready : false
  N : 624
  FF : 0xFFFFFFFF
  Seed : 48932432
  varianceTree: []
  
  
  getDataArrays: (data) ->
    @maxVariance = data.variance
    @width = @height = data.segments
    _w = Math.abs( data.bounds.max.x - data.bounds.min.x )
    @squareUnits = _w / data.segments
   
    
    
    @x = data.bounds.min.x
    @y = data.bounds.min.y
    @getVertices data
    @getIndices data
    data
    
    
  getIndices: (data) ->

    tree = @buildTree @width, @height, data
    @createIndexBuffer data, tree
    data
    
  createIndexBuffer: (data, tree) ->
    indices = new Uint16Array( @indexCount * 6  )
    w = (data.segments-1)*@squareUnits
    h = (data.segments-1)*@squareUnits
    jj = 0
    for i in [0 ... tree.length] by 1
      if not tree[i].lc?
        v1 = tree[i].v1
        v2 = tree[i].v2
        v3 = tree[i].v3
        indices[jj] = v1
        indices[jj+1] = v2 
        indices[jj+2] = v3
        
        jj+=3
        
        #_v1 = data.vertices[v1]
        #_v2 = data.vertices[v2]
        #_v3 = data.vertices[v3]
        #uva = new THREE.Vector2 _v1.x/w, _v1.z/h
        #uvb = new THREE.Vector2 _v2.x/w, _v2.z/h
        #uvc = new THREE.Vector2 _v3.x/w, _v3.z/h
        #data.faceVertexUvs[0].push([uva, uvb, uvc])
    data.indices = indices
    
  getVertices: (data) ->
    # we expect data to contain a Float32Array called vertices of the correct length
    #@initRandom parseInt( data.seed )
    #@initMap()
    
    x = data.bounds.min.x
    y = data.bounds.min.y
    width = height = data.segments
    
    _w = data.bounds.max.x - data.bounds.min.x
    _h = data.bounds.max.y - data.bounds.min.y
    
    stepX = Math.abs(_w / data.segments)
    stepY = Math.abs(_h / data.segments)
    

    jj = 0
    for i in [0 ... width] by 1
      _x = x + (i*stepX)
      for j in [0 ... height] by 1
        _y = y + (j*stepY)
        
        data.vertices.buf[jj] = (i*stepX)
        
        data.vertices.buf[jj+1] = @getNoiseValue( _x, _y ) * 1200;
        
        data.vertices.buf[jj+2] = (j*stepY)

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
    
  # Binary Triangle Tree functions
  newTri: (v1,v2,v3) ->
    return v1: v1, v2: v2, v3: v3, ln:null, rn:null, bn:null, lc:null, rc:null
    
    
  getVariance: (v1, v2, v3, geom) ->
    
    
    if Math.abs( geom.vertices[v3][0] - geom.vertices[v1][0] ) > @squareUnits or Math.abs(geom.vertices[v3][2] - geom.vertices[v1][2]) > @squareUnits
      hi = Math.round(((geom.vertices[v3][0] / @squareUnits) - (geom.vertices[v1][0] / @squareUnits)) / 2 + (geom.vertices[v1][0] / @squareUnits))
      hj = Math.round(((geom.vertices[v3][2] / @squareUnits) - (geom.vertices[v1][2] / @squareUnits)) / 2 + (geom.vertices[v1][2] / @squareUnits))
      
      
      
      vh = Math.round((hi)*(@width) + hj)
      
      
      
      #alt = @heightMapProvider.getHeightAt hi, hj
      alt = geom.vertices[vh][1] #@getNoiseValue @x+hi, @y+hj, 0.0, 1.0
      v = Math.abs(alt - ((geom.vertices[v1][1] + geom.vertices[v3][1]) / 2))
      v = Math.max(v, @getVariance(v2, vh, v1, geom))
      v = Math.max(v, @getVariance(v3, vh, v2, geom))
    else
      v = 0
    return v
    
    
    
  buildTree: (width, height, data) ->
    @tree = []
    @indexCount = 0
    @tree.push @newTri 0, width-1, width+(width*(height-1)) - 1
    @tree.push @newTri width-1+(width*(height-1)), (width*(height-1)), 0
    @tree[0].bn = 1
    @tree[1].bn = 0
    @buildFace 0, data
    @buildFace 1, data
    
    return @tree
    
  buildFace: (f, data) ->
    if @tree[f].lc?
      @buildFace @tree[f].lc, data
      @buildFace @tree[f].rc, data
    else
      v1 = @tree[f].v1
      v2 = @tree[f].v2
      v3 = @tree[f].v3
      
      
      if @getVariance(v1,v2,v3, data) > @maxVariance
        
        @splitFace f, data
        @buildFace @tree[f].lc, data
        @buildFace @tree[f].rc, data
      else
        @indexCount++
    return
  
  splitFace: (f, data) ->
    
    if @tree[f].bn?
      if @tree[@tree[f].bn].bn isnt f
        @splitFace @tree[f].bn, data
      @splitFace2 f, data
      @splitFace2 @tree[f].bn, data
      
      @tree[@tree[f].lc].rn = @tree[@tree[f].bn].rc
      @tree[@tree[f].rc].ln = @tree[@tree[f].bn].lc
      @tree[@tree[@tree[f].bn].lc].rn = @tree[f].rc
      @tree[@tree[@tree[f].bn].rc].ln = @tree[f].lc
    else
      @splitFace2 f, data
    return
  
  getApexIndex: (v1, v2, v3) ->
  
  
  splitFace2: (f, data) ->
    
    v1 = @tree[f].v1
    v2 = @tree[f].v2
    v3 = @tree[f].v3
    
    
    hi = ((data.vertices[v3][0] / @squareUnits) - (data.vertices[v1][0] / @squareUnits)) / 2 + (data.vertices[v1][0] / @squareUnits)
    hj = ((data.vertices[v3][2] / @squareUnits) - (data.vertices[v1][2] / @squareUnits)) / 2 + (data.vertices[v1][2] / @squareUnits)
    vh = Math.round((hi)*(@width) + hj)
    @tree.push @newTri v2, vh, v1
    @tree[f].lc = @tree.length-1
    @tree.push @newTri v3, vh, v2
    @tree[f].rc = @tree.length-1
    
    @tree[@tree[f].lc].ln = @tree[f].rc
    @tree[@tree[f].rc].rn = @tree[f].lc
    @tree[@tree[f].lc].bn = @tree[f].ln
    
    if @tree[f].ln?
      if @tree[@tree[f].ln].bn is f
        @tree[@tree[f].ln].bn = @tree[f].lc
      else
        if @tree[@tree[f].ln].ln is f
          @tree[@tree[f].ln].ln = @tree[f].lc
        else
          @tree[@tree[f].ln].rn = @tree[f].lc
    
    @tree[@tree[f].rc].bn = @tree[f].rn
    
    if @tree[f].rn?
      if @tree[@tree[f].rn].bn is f
        @tree[@tree[f].rn].bn = @tree[f].rc
      else
        if @tree[@tree[f].rn].rn is f
          @tree[@tree[f].rn].rn = @tree[f].rc  
        else
          @tree[@tree[f].rn].ln = @tree[f].rc
    return
    
    
