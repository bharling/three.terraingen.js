var container, camera, scene, renderer, output, mesh;

(function(THREE){
	
	
	// start with a random number generator
	var rng1 = new THREE.terraingen.MersenneTwisterProvider(23432432);
	
	// lets have another as well
	var rng2 = new THREE.terraingen.MersenneTwisterProvider(8712937752032);
	
	// plug that into a height map provider
	var noiseSource1 = new THREE.terraingen.generators.Perlin(rng1.random, 12, 0.0067);
	
	// lets mix in another
	var noiseSource2 = new THREE.terraingen.generators.Perlin(rng2.random, 6, 0.002);
	
	// Modify the value with Math.abs() - gives a sand-dune like effect
	var abssource = new THREE.terraingen.modifiers.Pow( noiseSource2, new THREE.terraingen.modifiers.Constant(2) )
	
	// lets have a constant
	var myConst = new THREE.terraingen.modifiers.Constant( 0.2 );
	
	// lets choose the min of the 
	var maxMod = new THREE.terraingen.modifiers.Min( noiseSource1, myConst );
	
	// add this to the other noise source
	var combined = new THREE.terraingen.modifiers.Add( maxMod, abssource );
	
	// scale down the height somewhat
	var shrunk = new THREE.terraingen.modifiers.Multiply( combined, new THREE.terraingen.modifiers.Constant( 0.4 ));
	
	
	sin = new THREE.terraingen.generators.SineX(
			new THREE.terraingen.modifiers.Multiply(
					shrunk, new THREE.terraingen.modifiers.Constant(0.007)
			)
	);
	
	//mixed = new THREE.terraingen.modifiers.Mix( shrunk, new THREE.terraingen.modifiers.Constant(0.0), sin )
	
	// convert to unsigned
	output = new THREE.terraingen.modifiers.Cache( new THREE.terraingen.modifiers.ConvertToUnsigned( shrunk ) );
	
	
	
	
	
	
	// plug that into a geometry provider
	var geomProvider = new THREE.terraingen.BTTGeometryProvider();
	geomProvider.source = output;
	
	// choose some origin in noise space
	var x = 500;
	var y = 40;
	
	// plug in a mesh provider
	var meshProvider = new THREE.terraingen.MeshProvider(x, y);
	meshProvider.geometryProvider = geomProvider;	
	
	
	
	
	
	
	bootstrap();

	//var mesh = meshProvider.get();	
	//mesh.scale.x = mesh.scale.y = mesh.scale.z = 4;
	//mesh.scale.y = 300;
	
	var patch = new THREE.terraingen.TerrainPatch( 512, 512, 257, 257, meshProvider );
	
	patch.addLOD(0.05, 1500);
	patch.addLOD(0.01, 1000);
	patch.addLOD(0.005, 750);
	patch.addLOD(0.001, 500);
	patch.addLOD(0.0003, 200);
	
	mesh = patch.get()
	
	mesh.scale.x = mesh.scale.y = mesh.scale.z = 4;
	mesh.scale.y = 300;
	
	scene.add(mesh);
	
	mesh.rotation.x = 4
	//drawHeightMap( hmGen, x, y );
	
	
	window.toggleWireframe = function () {
		mesh.material.wireframe = !mesh.material.wireframe;
	}
	
 	function drawHeightMap (mapProvider, xOffset, yOffset) {
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
 				hgt += hmGen.getHeightAt(xOffset + x,yOffset + 256 - y);
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
 		
		camera.position.multiplyScalar(0.999);
		mesh.update(camera);
		renderer.render( scene, camera );
 	}
	
	animate();
	
})(THREE);