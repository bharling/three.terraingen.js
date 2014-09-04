(function(THREE){
	var container, camera, scene, renderer;
	var noisegen = new THREE.terraingen.MersenneTwisterProvider(2);
	var hmGen = new THREE.terraingen.PerlinHeightMapProvider(noisegen.random, 8, 0.004);
	var geomProvider = new THREE.terraingen.GridGeometryProvider();
	geomProvider.heightMapProvider = hmGen;
	var meshProvider = new THREE.terraingen.MeshProvider();
	meshProvider.geometryProvider = geomProvider;	
	
	
	bootstrap();
	
	var mesh = meshProvider.get();
	
	mesh.scale.x = mesh.scale.y = mesh.scale.z = 10;
	mesh.scale.y = 400;
	
	
	scene.add(mesh);
	//drawHeightMap( hmGen );
	
	
	
	
 	function drawHeightMap (mapProvider) {
 		// setup a canvas to hold the heightmap
 		var canvas = document.createElement('canvas');
 		canvas.id = "hm-canvas";
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
 				var pix = Math.floor( (hgt) * 256 );
 				d[0] = d[1] = d[2] = pix;
 				d[3] = 255;
 				ctx.putImageData(id, x, y);
 			}
 		}
 	}
 	
 	
 	function bootstrap () {
 		container = document.getElementById('container');
 		
 		camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 1, 3500);
 		camera.position.z = 2000;
 		camera.position.y = 500;
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


		mesh.rotation.y = time * 0.5;

		renderer.render( scene, camera );
 	}
	
	animate();
	
})(THREE);