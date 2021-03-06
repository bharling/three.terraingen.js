getCameraTarget = (camera) ->
  l = new THREE.Vector3 0,0,-100
  camera.updateMatrixWorld()
  l.applyMatrix4 camera.matrixWorld
  return l
    
calculateCameraRect = (camera) ->
  hNear = 2 * Math.tan(camera.fov / 2) * camera.near
  wNear = hNear * camera.aspect
  
  hFar = 2 * Math.tan(camera.fov / 2) * camera.far
  wFar = hFar * camera.aspect
  
  p = camera.position.clone()
  l = getCameraTarget camera
  u = new THREE.Vector3 0.0,1.0,0.0
  
  d = new THREE.Vector3()
  d.subVectors(l, p)
  d.normalize()
  
  r = new THREE.Vector3()
  r.crossVectors(u, d)
  r.normalize()
  
  dTmp = d.clone()
  nc = new THREE.Vector3()
  nc.addVectors(p, dTmp.multiplyScalar(camera.near))
  
  uTmp = u.clone()
  rTmp = r.clone()
  ntr = new THREE.Vector3()
  
  ntr.addVectors(nc, uTmp.multiplyScalar(hNear / 2))
  ntr.sub(rTmp.multiplyScalar(wNear / 2))
  
  uTmp.copy(u)
  rTmp.copy(r)
  
  ntl = new THREE.Vector3()
  
  ntl.addVectors(nc, uTmp.multiplyScalar(hNear / 2))
  ntl.add( rTmp.multiplyScalar(wNear / 2))
  
  dTmp.copy(d)
  fc = new THREE.Vector3()
  fc.addVectors(p, dTmp.multiplyScalar(camera.far))
  
  uTmp.copy(u)
  rTmp.copy(r)
  ftr = new THREE.Vector3()
  ftr.addVectors(fc, uTmp.multiplyScalar(hFar / 2))
  ftr.sub(rTmp.multiplyScalar(wFar / 2))

  uTmp.copy(u)
  rTmp.copy(r)
  ftl = new THREE.Vector3()
  ftl.addVectors(fc, uTmp.multiplyScalar(hFar / 2))
  ftl.add(rTmp.multiplyScalar(wFar / 2));
  
  
  minX = Math.min ntr.x, ntl.x, ftr.x, ftl.x
  minY = Math.min ntr.z, ntl.z, ftr.z, ftl.z
  
  maxX = Math.max ntr.x, ntl.x, ftr.x, ftl.x
  maxY = Math.max ntr.z, ntl.z, ftr.z, ftl.z
  
  return [minX, minY, maxX, maxY]
  
NW = 0
NE = 1
SW = 2
SE = 3
  
class THREE.terraingen.Chunk
  constructor: (@bounds, @meshProvider, @scene,  @lod=1) ->
    @object = null
    @children = [null, null, null, null]
    @ready = false
    
  build: () ->
    if !@ready
      @meshProvider.setLOD @lod
      @meshProvider.setBounds @bounds
      @object = @meshProvider.get()
      @scene.add @object
      @ready = true
    @object.position.x -= @bounds.hs
    @object.position.z += @bounds.hs
    return @object
    
  split: () ->
    qw = @bounds.hs / 2.0
    nextLod = @lod / 2.0
    
    # NW
    nw = new THREE.Vector2 @bounds.c.x - qw, @bounds.c.y - qw
    nwbox = new THREE.terraingen.AABB( nw, qw )
    @children[NW] = new THREE.terraingen.Chunk( nwbox, @meshProvider, @scene, nextLod  )
    
    #NE
    ne = new THREE.Vector2 @bounds.c.x + qw, @bounds.c.y - qw
    nebox = new THREE.terraingen.AABB( ne, qw )
    @children[NE] = new THREE.terraingen.Chunk( nebox, @meshProvider, @scene, nextLod  )
    
    #SW
    sw = new THREE.Vector2 @bounds.c.x - qw, @bounds.c.y + qw
    swbox = new THREE.terraingen.AABB( sw, qw )
    @children[SW] = new THREE.terraingen.Chunk( swbox, @meshProvider, @scene, nextLod  )
    
    #SE
    se = new THREE.Vector2 @bounds.c.x + qw, @bounds.c.y + qw
    sebox = new THREE.terraingen.AABB( se, qw )
    @children[SE] = new THREE.terraingen.Chunk( sebox, @meshProvider, @scene, nextLod  )
    
    return
    
  calculateRho : (camera, K) ->
    pos = new THREE.Vector2 camera.position.x, camera.position.z
    D = pos.distanceTo @bounds.c
    #D -= @bounds.hs
    rho = @lod / D * K
    return rho
    
  get: () ->
    if not @ready
      @build()
    @object
    
  draw: (camera, K) ->
    tau = 1
    if @children[0] != null
      for c in @children
        c.object.visible = false
    if @calculateRho( camera, K) <= tau
      if not @ready
        @build()
      @object.visible = true
    else
      if @object != null
        @object.visible = false
      if @children[0] == null
        @split()
      for c in @children
        c.draw camera, K
    
    
        
    
    
  
  
  


class THREE.terraingen.Patch
  parent:null
  
  
  constructor : (@x=0, @y=0, @width=33, @height=33, @meshProvider, @parent=null) ->
    @object = new THREE.LOD()
    @meshProvider.setRegion @x, @y, @width, @height
    @object.position.x = @x
    @object.position.z = @y
    @ready = @building = false
    @distance = Infinity
    
  addLOD : (level, distance) ->
    @meshProvider.lod = level
    @meshProvider.setRegion @x, @y, @width, @height
    obj = @meshProvider.get()
    @object.addLevel(obj, distance)
    
  get: () ->
    return @object
    
    
class THREE.terraingen.Tile
  
  lods: [
    {
      level:0.005, distance:200
    },
    {
      level:0.02, distance: 400
    },
    {
      level:0.06, distance: 800
    }
  ]
  constructor: (@x=0, @y=0, @meshProvider) ->
    @queue = []
    @patches = []
    @object = new THREE.Object3D()
    @ready = false
    @doLOD = true
    # create blank patches
    for i in [0 ... 16] by 1
      for j in [0 ... 16] by 1
        patch = new THREE.terraingen.Patch( @x+(i*32), @y+(j*32), 33, 33, @meshProvider, @ )
        @queue.push patch
        
  build: () ->
    if !@ready
      if @queue.length
        next = @queue.pop()
        for lod in @lods
          next.addLOD lod.level, lod.distance
        @patches.push next
        @object.add next.get()
      else
        @ready = true
        
  buildPatch: (patch) ->
    for lod in @lods
      patch.addLOD lod.level, lod.distance
    patch.ready = true
    @object.add patch.get()
    
  addCompletedPatch:(patch) ->
    @patches.push patch
    @object.add patch.object
    
        
  
  update: (camera, frustum) ->
    to_build = []
    if @queue.length
      
      
      not_to_build = []
      
      for p in @queue
        contains = frustum.containsPoint(p.object.position)
        if contains
          to_build.push p
        else
          not_to_build.push p
      @queue = not_to_build
        
    
    
    if @doLOD
      for p in @patches
        contains = frustum.containsPoint(p.object.position)
        if contains
            p.object.update(camera)
        p.object.visible = contains
      
    return to_build

      
  get: () ->
    return @object
      
      

class THREE.terraingen.TileManager
  lods: [
    {
      level:0.002, distance:200
    },
    {
      level:0.007, distance: 600
    },
    {
      level:0.04, distance: 1200
    }
  ]
  
  constructor: (@meshProvider, @scene) ->
    @tiles = []
    @queue = []
    @currentTile = null
    @frustum = new THREE.Frustum()
    @cameraRect = []
    @lastQueueLength = 0
    
    # build empty tiles into the queue
    for i in [-2 ... 2]
      for j in [-2 ... 2]
        tile = new THREE.terraingen.Tile i*512, j*512, @meshProvider
        obj = tile.get()
        obj.scale.y = 150
        @scene.add obj
        @tiles.push tile
        
        
  buildPatch: (patch) ->
    for lod in @lods
      patch.addLOD lod.level, lod.distance
    patch.parent.addCompletedPatch( patch )
    
  
  update: (camera) ->
    @frustum.setFromMatrix( new THREE.Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ))
    @cameraRect = calculateCameraRect(camera)
    if @queue.length
      #@queue = @queue.sort (a,b) -> return a.distance < b.distance
      patch = @queue.pop()
      if not @frustum.containsPoint patch.object.position
        patch.parent.queue.push patch
      else
        @buildPatch patch
    

    for tile in @tiles
      to_build = tile.update camera, @frustum
      for b in to_build
        b.distance = camera.position.distanceToSquared b.object.position
        @queue.push b
    return
    
    

  
  
  
  
    
    
class QuadTreeNode
  maxobjects:8
  
  constructor:(@x, @y, @width, @height) ->
    @children = null
    @objects = []
    
  add: (object) ->
    if @objects
      @objects.push object
      
      if @objects.length > @maxobjects
        hw = @width * 0.5
        hh = @height * 0.5
        @children = [
          new QuadTreeNode( @x, @y, hw, hh ),
          new QuadTreeNode( @x + hw, @y, hw, hh),
          new QuadTreeNode( @x, @y + hh, hw, hh),
          new QuadTreeNode( @x + hw, @y + hh, hw, hh)
        ]
        
        for obj in @objects
          for node in @children
            if node.contains obj
              node.add obj
        @objects=null
      else
        for node in @children
          if node.contains object
            node.add object
  
    
    
