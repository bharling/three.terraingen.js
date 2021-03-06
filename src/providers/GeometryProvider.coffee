class THREE.terraingen.GeometryProvider
  geometry : null
  source: null
  x: 0
  y: 0
  width:257
  height:257
  
  constructor:(@source) ->
    
    
  setRegion: (@x=0, @y=0, @width=257, @height=257) ->
  
  get:() ->
    new THREE.BufferGeometry
    
    
class THREE.terraingen.BTTGeometryProvider extends THREE.terraingen.GeometryProvider
  constructor:(@source) ->
    
    
    
  get:(maxVariance=0.05) ->
    btt = new THREE.terraingen.BTT(@x, @y, @width, @height, @source, maxVariance)
    #@btt.createVertexBuffer()
    #@btt.buildTree @width, @height
    #@btt.createIndexBuffer()
    @createSkirts btt.build()
    
    
    
  createSkirts: (geom) ->
    for f in [0 ... geom.faces.length] by 1
      
      edgeVerts = []
      uvs = geom.faceVertexUvs[0][f]
      uva = uvs[0]
      uvb = uvs[1]
      uvc = uvs[2]
      face = geom.faces[f]
      
      if uva.x == 0 or uva.x == 1 or uva.y == 0 or uva.y == 1
        edgeVerts.push geom.vertices[face.a]
      if uvb.x == 0 or uvb.x == 1 or uvb.y == 0 or uvb.y == 1
        edgeVerts.push geom.vertices[face.b]
      if uvc.x == 0 or uvc.x == 1 or uvc.y == 0 or uvc.y == 1
        edgeVerts.push geom.vertices[face.c]
      #if edgeVerts.length == 2
      #  edgeVerts[0].y -= 0.02
      #  edgeVerts[1].y -= 0.02
    geom
          
class THREE.terraingen.AABB
  constructor: (center, halfSize) ->
    @c = center
    @hs = halfSize
    @computeBounds()
    
  computeBounds: () ->
    xmin = @c.x - @hs
    ymin = @c.y - @hs
    xmax = @c.x + @hs
    ymax = @c.y + @hs
    @min = new THREE.Vector2( xmin, ymin )
    @max = new THREE.Vector2( xmax, ymax )
    @width = @height = @hs * 2
    return
    
  containsPoint: (point) ->
    if point.x < @min.x or point.x > @max.x or point.y < @min.y or point.y > @max.y
      return false
    return true
    
  containsAABB: (box) ->
    if ( @min.x <= box.min.x ) && ( box.max.x <= @max.x ) && ( @min.y <= box.min.y ) && ( box.max.x <= @max.y )
      return true
    return false
    
  intersects: (box) ->
    if box.max.x < @min.x or box.min.x > @max.x or box.max.y < @min.y or box.min.y > @max.y
      return false
    return true 
    
  
    
    
  
    
    
    
  
    
class THREE.terraingen.PlaneGeometryProvider extends THREE.terraingen.GeometryProvider
  vertsPerSide : 32
  
  constructor: (@source) ->
    @lod = 1.0
    
  setBounds: (@bounds) ->
    
  setRegion: (x, y, width, height) ->
    hs = width / 2
    c = new THREE.Vector2( x + hs, y + hs )
    @bounds = new THREE.terraingen.AABB( c, hs )
    
    
  setLOD: (@lod) ->
    
    
  build: () ->
    color = new THREE.Color( 0xffffff )
    color.setRGB( Math.random(), Math.random(), Math.random() )
    w1 = @vertsPerSide + 1
    stride = @bounds.width / @vertsPerSide
    normal = new THREE.Vector3( 0, 1, 0 )
    geom = new THREE.Geometry()
    hw = @bounds.width / 2
    
    for i in [0 ... w1] by 1
      y = (i * stride)
      for j in [0 ... w1] by 1
        x = (j * stride)
        
        geom.vertices.push new THREE.Vector3( x, 0.0, - y )
        geom.colors.push color
        
    for iz in [0 ... @vertsPerSide] by 1
      for ix in [0 ... @vertsPerSide] by 1
        
        a = ix + w1 * iz
        b = ix + w1 * ( iz + 1 )
        c = ( ix + 1 ) + w1 * ( iz + 1 )
        d = ( ix + 1 ) + w1 * iz
        
        
        face = new THREE.Face3( a, b, d )
        face.normal.copy normal
        face.vertexNormals.push normal.clone(), normal.clone(), normal.clone()
        
        face.vertexColors.push color, color, color
        
        geom.faces.push face
        
        face = new THREE.Face3( b, c, d )
        face.normal.copy normal
        face.vertexNormals.push normal.clone(), normal.clone(), normal.clone()
        
        face.vertexColors.push color, color, color
        geom.faces.push face
        
    console.log geom
    geom
        
        
    
    
  get: () ->
    return @build()
        
    
    
    

    
# This code ported from the Director example by Patrick Murris
# http://patrick.murris.com/articles/btt_3d_terrain.htm
# Much credit and appreciation to him..
    
class THREE.terraingen.BTT
  maxVariance: 0.02
  squareUnits: 1
  heightScale: 1
  
  constructor: (@x, @y, @width, @height, @heightMapProvider, @maxVariance) ->
    @tree = []
    
    
  cleanup: () ->
    @tree = []
    
    
    
  build: () ->
    @tree = []
    
    geom = new THREE.Geometry()
    @createVertexBuffer geom
    
    
    
    @buildTree @width, @height, geom
    
    @createIndexBuffer geom
    @cleanup()
    geom
    
    
   
   
  createVertexBuffer: (geom) ->
    console.log @width, @height
    for i in [0 ... @width] by 1
      for j in [0 ... @height] by 1
        alt = (@heightMapProvider.get @x+(i*@squareUnits), @y+(j*@squareUnits)) * @heightScale
        geom.vertices.push new THREE.Vector3 i*@squareUnits, alt, j*@squareUnits
        
        
  createIndexBuffer: (geom) ->
    w = (@width-1)*@squareUnits
    h = (@height-1)*@squareUnits
    for i in [0 ... @tree.length] by 1
      if not @tree[i].lc?
        v1 = @tree[i].v1
        v2 = @tree[i].v2
        v3 = @tree[i].v3
        geom.faces.push new THREE.Face3 v1, v2, v3
        
        _v1 = geom.vertices[v1]
        _v2 = geom.vertices[v2]
        _v3 = geom.vertices[v3]
        
        
        
        
        uva = new THREE.Vector2 _v1.x/w, _v1.z/h
        uvb = new THREE.Vector2 _v2.x/w, _v2.z/h
        uvc = new THREE.Vector2 _v3.x/w, _v3.z/h
        
        geom.faceVertexUvs[0].push([uva, uvb, uvc])
    return
        
  getSeriazlized: () ->
    result = ""
    for i in [0 ... @tree.length] by 1
      if not @tree[i].lc?
        result += "0"
      else
        result += "1"
    return result
    
  newTri: (v1,v2,v3) ->
    return v1: v1, v2: v2, v3: v3, ln:null, rn:null, bn:null, lc:null, rc:null
    
    
  getVariance: (v1, v2, v3, geom) ->
    
    
    if Math.abs( geom.vertices[v3].x - geom.vertices[v1].x ) > @squareUnits or Math.abs(geom.vertices[v3].z - geom.vertices[v1].z) > @squareUnits
      hi = Math.round(((geom.vertices[v3].x / @squareUnits) - (geom.vertices[v1].x / @squareUnits)) / 2 + (geom.vertices[v1].x / @squareUnits))
      hj = Math.round(((geom.vertices[v3].z / @squareUnits) - (geom.vertices[v1].z / @squareUnits)) / 2 + (geom.vertices[v1].z / @squareUnits))
      
      
      
      vh = Math.round((hi)*(@width) + hj)
      
      #alt = @heightMapProvider.getHeightAt hi, hj
      alt = @heightMapProvider.get @x+hi, @y+hj
      v = Math.abs(alt - ((geom.vertices[v1].y + geom.vertices[v3].y) / 2))
      v = Math.max(v, @getVariance(v2, vh, v1, geom))
      v = Math.max(v, @getVariance(v3, vh, v2, geom))
    else
      v = 0
    return v
    
    
  buildTree: (width, height, geom) ->
    @tree.push @newTri 0, width-1, width+(width*(height-1)) - 1
    @tree.push @newTri width-1+(width*(height-1)), (width*(height-1)), 0
    @tree[0].bn = 1
    @tree[1].bn = 0
    @buildFace 0, geom
    @buildFace 1, geom
    return
    
  buildFace: (f, geom) ->
    
    if @tree[f].lc?
      @buildFace @tree[f].lc, geom
      @buildFace @tree[f].rc, geom
    else
      v1 = @tree[f].v1
      v2 = @tree[f].v2
      v3 = @tree[f].v3
      
      
      if @getVariance(v1,v2,v3, geom) > @maxVariance
        
        @splitFace f, geom
        @buildFace @tree[f].lc, geom
        @buildFace @tree[f].rc, geom
    return
  
  splitFace: (f, geom) ->
    
    
    if @tree[f].bn?
      if @tree[@tree[f].bn].bn isnt f
        @splitFace @tree[f].bn, geom
      @splitFace2 f, geom
      @splitFace2 @tree[f].bn, geom
      
      @tree[@tree[f].lc].rn = @tree[@tree[f].bn].rc
      @tree[@tree[f].rc].ln = @tree[@tree[f].bn].lc
      @tree[@tree[@tree[f].bn].lc].rn = @tree[f].rc
      @tree[@tree[@tree[f].bn].rc].ln = @tree[f].lc
    else
      @splitFace2 f, geom
    return
  
  getApexIndex: (v1, v2, v3) ->
  
  
  splitFace2: (f, geom) ->
    
    
    v1 = @tree[f].v1
    v2 = @tree[f].v2
    v3 = @tree[f].v3
    
    
    hi = ((geom.vertices[v3].x / @squareUnits) - (geom.vertices[v1].x / @squareUnits)) / 2 + (geom.vertices[v1].x / @squareUnits)
    hj = ((geom.vertices[v3].z / @squareUnits) - (geom.vertices[v1].z / @squareUnits)) / 2 + (geom.vertices[v1].z / @squareUnits)
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
    
    
class THREE.terraingen.GridGeometryProvider extends THREE.terraingen.GeometryProvider
  constructor:(@x=0, @y=0, @width=256, @height=256, @segments=128) ->
  
  
  _build: () ->
    @geometry = new THREE.Geometry
    
    width_half = @width / 2
    height_half = @height / 2
    
    gridX = @segments
    gridZ = @segments
    
    gridX1 = gridX + 1
    gridZ1 = gridZ + 1
    
    segment_width = @width / gridX
    segment_height = @height / gridZ
    
    normal = new THREE.Vector3 0, 0, 1
    
    for iz in [0 ... gridZ1] by 1
      y = iz * segment_height
      
      for ix in [0 ... gridX1] by 1
        
        x = ix * segment_width
        
        hgt = @source.get x, y
        
        @geometry.vertices.push new THREE.Vector3 x, hgt, y
        
    for iz in [0 ... gridZ] by 1
      
      for ix in [0 ... gridX] by 1
        
        a = ix + gridX1 * iz
        b = ix + gridX1 * (iz+1)
        c = (ix + 1) + gridX1 * (iz+1)
        d = (ix + 1) + gridX1 * iz
        
        uva = new THREE.Vector2 ix / gridX, 1 - iz / gridZ
        uvb = new THREE.Vector2 ix / gridX, 1 - (iz + 1) / gridZ
        uvc = new THREE.Vector2 (ix + 1) / gridX, 1 - (iz+1) / gridZ
        uvd = new THREE.Vector2 (ix + 1) / gridX, 1 - iz / gridZ
        
        face = new THREE.Face3 a, b, d
        face.normal.copy normal
        
        face.vertexNormals.push normal.clone(), normal.clone(), normal.clone()
        
        @geometry.faces.push face
        
        @geometry.faceVertexUvs[0].push [uva, uvb, uvc]
        
        face = new THREE.Face3 d, b, c
        face.normal.copy normal
        face.vertexNormals.push normal.clone(), normal.clone(), normal.clone()
        
        @geometry.faces.push face
        @geometry.faceVertexUvs[0].push [uvb.clone(), uvc, uvd.clone()]
  
  get:() ->
    @_build()
    @geometry
    
