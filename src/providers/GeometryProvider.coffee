class THREE.terraingen.GeometryProvider
  geometry : null
  heightMapProvider: null
  
  constructor:(@x=0, @y=0, @width=256, @height=256) ->
  
  get:() ->
    new THREE.BufferGeometry
    
    
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
    
