(function(THREE){
	var container, camera, scene, renderer;
	var noisegen = new THREE.terraingen.MersenneTwisterProvider("barrie");
	var hmGen = new THREE.terraingen.PerlinHeightMapProvider(noisegen.random, 12, 0.005);
	hmGen.filters = [ new THREE.terraingen.filters.Cliffs(0.3, 0.2), new THREE.terraingen.filters.Cliffs(0.7, 0.1), new THREE.terraingen.filters.HighPass(0.6)]
	var geomProvider = new THREE.terraingen.BTTGeometryProvider();
	geomProvider.heightMapProvider = hmGen;
	var meshProvider = new THREE.terraingen.MeshProvider();
	meshProvider.geometryProvider = geomProvider;	
	
	
	bootstrap();
	
	var mesh = meshProvider.get();
	
	mesh.scale.x = mesh.scale.y = mesh.scale.z = 4;
	mesh.scale.y = 300;
	
	
	scene.add(mesh);
	
	mesh.rotation.x = 4
	drawHeightMap( hmGen );
	
	
	window.toggleWireframe = function () {
		mesh.material.wireframe = !mesh.material.wireframe;
	}
	
 	function drawHeightMap (mapProvider) {
 		// setup a canvas to hold the heightmap
 		var canvas = document.createElement('canvas');
 		canvas.id = "heightMap";
 		canvas.height = 256;
 		canvas.width = 256;
 		document.body.appendChild(canvas);
 		
 		var ctx = canvas.getContext('2d')
 		var id = ctx.createImageData(1,1);
 		var d = id.data;
 		
 		
 		for (var x = 0; x < 256; x++) {
 			for (var y = 0; y < 256; y++) {
 				var hgt = 0.0; 
 				hgt += hmGen.getHeightAt(x,y);
 				var pix = Math.floor( (1.0-hgt) * 256 );
 				d[0] = d[1] = d[2] = pix;
 				d[3] = 255;
 				ctx.putImageData(id, x, y);
 			}
 		}
 	}
 	
 	
 	function bootstrap () {
 		container = document.getElementById('container');
 		
 		camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 1, 8000);
 		camera.position.z = 2000;
 		camera.position.y = 300;
 		camera.position.x = 500;
 		
 		scene = new THREE.Scene();
 		
 		//scene.add( new THREE.AmbientLight( 0x444444 ));
 		
 		renderer = new THREE.WebGLRenderer();
 		
 		renderer.setSize( window.innerWidth, window.innerHeight );
 		
 		container.appendChild(renderer.domElement);
 		
 	}
 	
 	
 	function animate () {
 		requestAnimationFrame(animate);
 		render();
 	}
	
 	
 	function render () {
 		var time = Date.now() * 0.001;


		//mesh.rotation.y = time * 0.2;
 		
		

		renderer.render( scene, camera );
 	}
	
	animate();
	
})(THREE);