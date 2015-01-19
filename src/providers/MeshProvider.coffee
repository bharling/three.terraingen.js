

class THREE.terraingen.MeshProvider
  
  geometryProvider : null
  materialProvider : null
  
  lod: 0.0001
  
  constructor: (@geometryProvider) ->
    
    
  setRegion: (@x=0, @y=0, @width=257, @height=257) ->
      
  setBounds: (bounds) ->
    @width = @height = bounds.hs * 2
    @x = bounds.c.x - bounds.hs
    @y = bounds.c.y - bounds.hs
    
  setLOD: (@lod) ->
  
  build: () ->
    @geometryProvider.setRegion @x, @y, @width, @height
    geom = @geometryProvider.get(@lod)
    geom.computeFaceNormals()
    geom.computeVertexNormals(true)
    geom.mergeVertices()
    geom = new THREE.BufferGeometry().fromGeometry(geom)
    material = new THREE.MeshBasicMaterial({shading:THREE.SmoothShading, wireframe:true})
    mesh = new THREE.Line(geom, material)
    #geom.dispose()
    
  get: () ->
    @build()
  

	    

	  
	  
	  
	  	  
	  
	
		
