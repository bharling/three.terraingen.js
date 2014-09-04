class THREE.terraingen.GeometryProvider
  geometry : null
  heightMapProvider: null
  
  constructor:(@x=0, @y=0, @width=256, @height=256) ->
  
  get:() ->
    new THREE.BufferGeometry
    
    
    
class BTT
  bn:null
  ln:null
  rn:null
  lc:null
  rc:null
  depth:0
  has_children:false
  
  
  constructor: (@parent=null) ->
    
  split: () ->
    if @hasChildren
      return
    
    if @bn?
      if @bn.bn != @
        @bn.split()
        
      @bn.split2()
      @split2()
      
      @lc.rn = @bn.rc
      @rc.ln = @bn.lc
      @bn.lc.rn = @rc
      @bn.rc.ln = @lc
    else
      @split2()
      @lc.rn = null
      @rc.ln = null
     
    return
    
  split2: () ->
    if @hasChildren
      return
    @lc = new BTT(@)
    @rc = new BTT(@)
    
    @hasChildren = true
    
    @lc.ln = @rc
    @rc.rn = @lc
    
    @lc.bn = @ln
    
    if @ln?
      if @ln.bn is @
        @ln.bn = @lc
      else
        if @ln.ln is @
          @ln.ln = @lc
        else
          @ln.rn = @lc
    @rc.bn = @rn
    if @rn?
      if @rn.bn is @
        @rn.bn = @
      else
        if @rn.rn is @
          @rn.rn = @rc
        else
          @rn.ln = @rc
    return
    
    
    
class THREE.terraingen.ROAMGeometryProvider extends THREE.terraingen.GeometryProvider
  left_root : new BTT()
  right_root : new BTT()
  
  constructor:(@x=0, @y=0, @width=256, @height=256, @max_variance=0.02) ->
    @left_root.bn = @right_root
    @right_root.bn = @left_root
    
    
  _getVariance: (apX, apY, lfX, lfY, rtX, rtY) ->
    heightA = @heightMapProvider.getHeightAt lfX, lfY
    heightB = @heightMapProvider.getHeightAt rtX, rtY
    avgHeight = (heightA + heightB) * 0.5
    cX = (lfX+rtX) >> 1
    cY = (lfY+rtY) >> 1
    realHeight = @heightMapProvider.getHeightAt cX, cY
    
    return Math.abs realHeight - avgHeight
  
  _traverseVarianceIndex: (apX, apY, lfX, lfY, rtX, rtY, depth, maxdepth) ->
    
    v = @_getVariance apX, apY, lfX, lfY, rtX, rtY
    cX = (lfX+rtX)>>1
    cY = (lfY+rtY)>>1
    if depth <= maxdepth
      v = Math.max(v, @_getVariance cX, cY, apX, apY, lfX, lfY)
      v = Math.max(v, @_getVariance cX, cY, rtX, rtY, apX, apY)
      
    ret = if v > @max_variance then "1" else "0"
    
    if depth >= maxdepth and ret == "0"
      return "0"
      
    ret += @_traverseVarianceIndex cX, cY, apX, apY, lfX, lfY, depth+1, maxdepth
    ret += @_traverseVarianceIndex cX, cY, rtX, rtY, apX, apY, depth+1, maxdepth
    
    ret
    
  _buildVarianceIndex: (lod=8) ->
    leftIndex = @_traverseVarianceIndex 0, 0, 0, @height, @width, 0, 0, lod
    rightIndex = @_traverseVarianceIndex @width, @height, @width, 0, 0, @height, 0, lod
    rightIndex + leftIndex
    
  createTree: (node, apX, apY, lfX, lfY, rtX, rtY, depth, maxdepth) ->
    v = @_getVariance apX, apY, lfX, lfY, rtX, rtY
    cX = (lfX+rtX)>>1
    cY = (lfY+rtY)>>1
    if depth <= maxdepth
      v = Math.max(v, @_getVariance cX, cY, apX, apY, lfX, lfY)
      v = Math.max(v, @_getVariance cX, cY, rtX, rtY, apX, apY)
    split = v > @max_variance
    if split
      node.split()
    if node.hasChildren  
      @createTree node.lc, cX, cY, apX, apY, lfX, lfY, depth+1, maxdepth
      @createTree node.rc, cX, cY, rtX, rtY, apX, apY, depth+1, maxdepth
    return
    
  createGeom: (node, apX, apY, lfX, lfY, rtX, rtY) ->
    if node.hasChildren
      cX = (lfX+rtX)>>1
      cY = (lfY+rtY)>>1
      @createGeom node.lc, cX, cY, apX, apY, lfX, lfY
      @createGeom node.rc, cX, cY, rtX, rtY, apX, apY
    else
      ind = @geometry.vertices.length - 1
      apHeight = @heightMapProvider.getHeightAt apX, apY
      lfHeight = @heightMapProvider.getHeightAt lfX, lfY
      rtHeight = @heightMapProvider.getHeightAt rtX, rtY
      
      @geometry.vertices.push new THREE.Vector3 apX, apHeight, apY
      @geometry.vertices.push new THREE.Vector3 lfX, lfHeight, lfY
      @geometry.vertices.push new THREE.Vector3 rtX, rtHeight, rtY
      
      @geometry.faces.push new THREE.Face3 ind+1, ind+2, ind+3
     
  _buildSplits: (lod=8) ->
    @createTree @left_root, 0, 0, 0, @height, @width, 0, 0, lod
    @createTree @right_root, @width, @height, @width, 0, 0, @height, 0, lod
    
  _buildGeometry: () ->
    @geometry = new THREE.Geometry()
    @createGeom @left_root, 0, 0, 0, @height, @width, 0
    @createGeom @right_root, @width, @height, @width, 0, 0, @height, 0
    
  get: () ->
    console.log @_buildVarianceIndex()
    @_buildSplits()
    @_buildGeometry()
    @geometry
    
    
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
      y = iz * segment_height - height_half
      
      for ix in [0 ... gridX1] by 1
        
        x = ix * segment_width - width_half
        
        hgt = @heightMapProvider.getHeightAt x, y
        
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
        
        face = new THREE.Face3 b, c, d
        face.normal.copy normal
        face.vertexNormals.push normal.clone(), normal.clone(), normal.clone()
        
        @geometry.faces.push face
        @geometry.faceVertexUvs[0].push [uvb.clone(), uvc, uvd.clone()]
  
  get:() ->
    @_build()
    @geometry
    
