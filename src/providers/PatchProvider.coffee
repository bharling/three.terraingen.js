class THREE.terraingen.TerrainPatch
  parent:null
  object: new THREE.LOD()
  
  constructor : (@x=0, @y=0, @width=257, @height=257, @meshProvider, @parent=null) ->
    @meshProvider.setRegion @x, @y, @width, @height
    
  addLOD : (level, distance) ->
    @meshProvider.lod = level
    obj = @meshProvider.get()
    @object.addLevel(obj, distance)
    
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
  
    
    
