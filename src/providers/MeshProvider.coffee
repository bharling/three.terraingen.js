THREE = window.THREE or {}

THREE.terraingen = THREE.terraingen || {}

class THREE.terraingen.MeshProvider
  
  geometryProvider : null
  materialProvider : null
  mesh : null
  
  constructor: (@x=0, @y=0, @width=256, @height=256) ->
  
  
  build: () ->
    geom = @geometryProvider.get()
    material = new THREE.MeshBasicMaterial wireframe:true
    @mesh = new THREE.Mesh(geom, material)
    
  get: () ->
    @build()
    @mesh
  

	    

	  
	  
	  
	  	  
	  
	
		
