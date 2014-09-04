THREE = window.THREE or {}

THREE.terraingen = THREE.terraingen || {}

class THREE.terraingen.MeshProvider
	constructor: (@x=0, @y=0, @width=256, @height=256) ->
	  
	build: (@heightMapProvider) ->
	  
	get_geometry: () ->
	  new THREE.Geometry()
	  
	  
	  
class THREE.terraingen.GridMeshProvider extends THREE.terraingen.MeshProvider
  get_geometry: () ->
    verts = []
    faces = []
    for x in [0 ... @width] by 1
      for y in [0 ... @height] by 1
        x_world = @x + x
        y_world = @y + y
        hgt = @heightMapProvider.getHeightAt x,y
	  
	  	  
	  
	
		
