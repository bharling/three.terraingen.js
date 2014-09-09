class THREE.terraingen.Patch
  parent:null
  
  
  constructor : (@x=0, @y=0, @width=33, @height=33, @meshProvider, @parent=null) ->
    @object = new THREE.LOD()
    @meshProvider.setRegion @x, @y, @width, @height
    @object.position.x = @x
    @object.position.z = @y
    
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
      level:0.005, distance:500
    },
    {
      level:0.02, distance: 1500
    },
    {
      level:0.08, distance: 2500
    }
  ]
  constructor: (@x=0, @y=0, @meshProvider) ->
    @queue = []
    @patches = []
    @object = new THREE.Object3D()
    # create blank patches
    for i in [0 ... 16] by 1
      for j in [0 ... 16] by 1
        patch = new THREE.terraingen.Patch( i*32, j*32, 33, 33, @meshProvider )
        @queue.push patch
  
  update: (camera) ->
    if !@ready
      if @queue.length
        next = @queue.pop()
        for lod in @lods
          next.addLOD lod.level, lod.distance
        @patches.push next
        @object.add next.get()
      else
        @ready = true
    for p in @patches
      p.object.update(camera)
  get: () ->
    return @object
      
      
      
        
    
  
    
    
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
    
      
    

class THREE.terraingen.PatchManager
  
    
    
