THREE = window.THREE or {}

THREE.terraingen = THREE.terraingen || {}

class THREE.terraingen.MeshProvider
  
  geometryProvider : null
  materialProvider : null
  mesh : null
  
  constructor: (@x=0, @y=0, @width=256, @height=256) ->
  
  
  build: () ->
    geom = @geometryProvider.get(0.001)
    geom.mergeVertices()
    geom.computeFaceNormals()
    geom.computeVertexNormals(true)
    #material = new THREE.MeshBasicMaterial wireframe:true
    material = new THREE.MeshNormalMaterial({shading:THREE.SmoothShading})
    @mesh = new THREE.Mesh(geom, material)
    
  get: () ->
    @build()
    @mesh
  

	    

	  
	  
	  
	  	  
	  
	
		
