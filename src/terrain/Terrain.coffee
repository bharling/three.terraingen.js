window.tgen or= {}

class tgen.TriTreeNode
  constructor: () ->
    @me = 0
    @leftNeighbour = 0
    @rightNeighbour = 0
    @baseNeighbour = 0
    
    @leftChild = 0
    @rightChild = 0
    
    @variance = 0
    
  isLeaf: () ->
    if @me == 0
      return false
    if @leftChild == 0 && @rightChild == 0
      return false
    return true


class tgen.Landscape
  maxTris : 25000
  MAP_SIZE : 128
  NUM_PATCHES_PER_SIDE : 32
  PATCH_SIZE : @MAP_SIZE / @NUM_PATCHES_PER_SIDE
  
  constructor: () ->
    @allocatedTris = 0
    @nodeList = (new tgen.TriTreeNode() for i in [0 ... @maxTris])
    
    
  setHeightMapProvider: (@heightMapProvider) ->
    
  getHeight:(x,y,z=0.0) ->
    return @heightMapProvider.get x, y, z
    
    
class tgen.Patch
  constructor: (@land) ->
    
  init: (@worldX, @worldY) ->
    @baseLeft = @land.getNextNode()
    @baseRight = @land.getNextNode()
    @reset()
    
  reset: () ->
    @baseLeft.leftChild = @baseLeft.rightChild = @baseRight.leftChild = @baseRight.rightChild = 0
    @baseLeft.leftNeighbour = @baseLeft.rightNeighbour = @baseRight.leftNeighbour = @baseRight.rightNeighbour = 0
    
    @baseLeft.baseNeighbour = @baseRight.me
    @baseRight.baseNeighbour = @baseLeft.me
    
  tessellate: () ->
    @buildTriangle(
                  @baseLeft, 
                  @worldX, 
                  @worldY + @land.PATCH_SIZE,
                  @worldX + @land.PATCH_SIZE,
                  @worldY,
                  @worldX,
                  @worldY
    )
    
    @buildTriangle(
                  @baseRight,
                  @worldX + @land.PATCH_SIZE,
                  @worldY,
                  @worldX,
                  @worldY + @land.PATCH_SIZE,
                  @worldX + @land.PATCH_SIZE,
                  @worldY + @land.PATCH_SIZE
    )
    
  split: (tri) ->
    if not tri.isLeaf()
      return
      
    if tri.baseNeighbour != 0 and ( @land.nodes[ tri.baseNeighbour ].baseNeighbour != tri.me )
      @split land.nodes[ tri.baseNeighbour ]
      
    tri.leftChild = @land.getNextNode()
    tri.rightChild = @land.getNextNode()
    
    lc = @land.nodes[ tri.leftChild ]
    rc = @land.nodes[ tri.rightChild ]
    
    
    
