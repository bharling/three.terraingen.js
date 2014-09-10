class THREE.terraingen.GeometryProvider
  geometry : null
  source: null
  x: 0
  y: 0
  width:257
  height:257
  
  constructor:() ->
    
    
  setRegion: (@x=0, @y=0, @width=257, @height=257) ->
  
  get:() ->
    new THREE.BufferGeometry
    
    
    
class THREE.terraingen.BTTGeometryProvider extends THREE.terraingen.GeometryProvider
  constructor:(@x=0, @y=0, @width=257, @height=257) ->
    
    
  get:(maxVariance=0.05) ->
    btt = new THREE.terraingen.BTT(@x, @y, @width, @height, @source, maxVariance)
    #@btt.createVertexBuffer()
    #@btt.buildTree @width, @height
    #@btt.createIndexBuffer()
    btt.build()
    
    
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
    for i in [0 ... @width] by 1
      for j in [0 ... @height] by 1
        alt = (@heightMapProvider.get @x+i, @y+j) * @heightScale
        geom.vertices.push new THREE.Vector3 i*@squareUnits, alt, j*@squareUnits
        
  createIndexBuffer: (geom) ->
    for i in [0 ... @tree.length] by 1
      if not @tree[i].lc?
        v1 = @tree[i].v1
        v2 = @tree[i].v2
        v3 = @tree[i].v3
        geom.faces.push new THREE.Face3 v1, v2, v3
        
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
    
