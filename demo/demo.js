var container, camera, scene, renderer, output, mesh, tile, controls, tileManager;

(function(THREE){
	RNG = THREE.terraingen.MersenneTwisterProvider;
	
	Perlin = THREE.terraingen.generators.Perlin, Max = THREE.terraingen.modifiers.Max, Constant = THREE.terraingen.modifiers.Constant;
	
	Min = THREE.terraingen.modifiers.Min, Invert = THREE.terraingen.modifiers.Invert, Mix = THREE.terraingen.modifiers.Mix;
	
	var Abs = THREE.terraingen.modifiers.Abs, Convert = THREE.terraingen.modifiers.ConvertToUnsigned;
	
	var source = //new Convert(
		new Mix (
			new Invert(
				new Abs(
					new Perlin(
						new RNG(6543654).random, 12, 0.0008
					) 
				)
			),
			
			new Perlin(
				new RNG(3234).random, 4, 0.0002
			),
			
			new Perlin(
				new RNG(19029).random, 4, 0.0004
			)
		)

    //);
	
	output = new THREE.terraingen.modifiers.Cache( source );
	
	/*
	// start with a random number generator
	var rng1 = new THREE.terraingen.MersenneTwisterProvider(23432432);
	
	// lets have another as well
	var rng2 = new THREE.terraingen.MersenneTwisterProvider(8712937752032);
	
	// plug that into a height map provider
	var noiseSource1 = new THREE.terraingen.generators.Perlin(rng1.random, 12, 0.0067);
	
	// lets mix in another
	var noiseSource2 = new THREE.terraingen.generators.Perlin(rng2.random, 6, 0.002);
	
	// Modify the value with Math.abs() - gives a sand-dune like effect
	var abssource = new THREE.terraingen.modifiers.Pow( noiseSource2, new THREE.terraingen.modifiers.Constant(2) );
	
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
	
	
	
	*/
	
	
	// plug that into a geometry provider
	var geomProvider = new THREE.terraingen.BTTGeometryProvider();
	geomProvider.source = output;
	
	// choose some origin in noise space
	var x = -256;
	var y = -256;
	
	// plug in a mesh provider
	var meshProvider = new THREE.terraingen.MeshProvider();
	meshProvider.geometryProvider = geomProvider;	
	
	
	
	
	
	
	bootstrap();

	
	
	tileManager = new THREE.terraingen.TileManager(meshProvider, scene);
	

	
	
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
 		
 		
 		camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 1, 8000);
 		camera.position.z = 500
 		camera.position.y = 100
 		camera.lookAt(new THREE.Vector3(0,0,0))
 		
 		scene = new THREE.Scene();
 		
 		//scene.add( new THREE.AmbientLight( 0x444444 ));
 		
 		renderer = new THREE.WebGLRenderer();
 		
 		renderer.setSize( window.innerWidth, window.innerHeight );
 		
 		document.body.appendChild(renderer.domElement);
 		
 		controls = new THREE.OrbitControls(camera);
 		//controls.addEventListener('change', render);
 		
 	}
 	
 	
 	function animate () {
 		requestAnimationFrame(animate);
 		controls.update();
 		tileManager.update(camera);
 		render();
 	}
	
 	
 	function render () {
 		var time = Date.now() * 0.001;

		
		//mesh.rotation.y = time * 0.2;
 		
		
		renderer.render( scene, camera );
 	}
	
	animate();
	
})(THREE);