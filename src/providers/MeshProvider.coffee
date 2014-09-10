THREE = window.THREE or {}

THREE.terraingen = THREE.terraingen || {}

class THREE.terraingen.MeshProvider
  
  geometryProvider : null
  materialProvider : null
  
  lod: 0.0001
  
  constructor: (@x=0, @y=0, @width=257, @height=257) ->
    
    
  setRegion: (@x=0, @y=0, @width=257, @height=257) ->
  
  
  build: () ->
    @geometryProvider.setRegion @x, @y, @width, @height
    geom = @geometryProvider.get(@lod)
    geom.computeFaceNormals()
    geom.computeVertexNormals(true)
    geom.mergeVertices()
    geom = new THREE.BufferGeometry().fromGeometry(geom)
    material = new THREE.MeshNormalMaterial({shading:THREE.SmoothShading, wireframe:true})
    mesh = new THREE.Mesh(geom, material)
    #geom.dispose()
    
  get: () ->
    @build()
  

	    

	  
	  
	  
	  	  
	  
	
		
