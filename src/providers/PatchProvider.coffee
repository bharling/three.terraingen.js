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
    if !@ready
      
      
      not_to_build = []
      
      for p in @queue
        contains = frustum.containsPoint(p.object.position)
        if contains
          to_build.push p
        else
          not_to_build.push p
      @queue = not_to_build
      if @queue.length == 0
        @ready = true
        
    
    
    
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
    if @queue.length
      @queue = @queue.sort (a,b) -> return a.distance < b.distance
      @buildPatch @queue.pop()
    @frustum.setFromMatrix( new THREE.Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ))
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
  
    
    
