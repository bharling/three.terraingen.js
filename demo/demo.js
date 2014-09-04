(function(THREE){
	
	var noisegen = new THREE.terraingen.MersenneTwisterProvider();
	var hmGen = new THREE.terraingen.PerlinHeightMapProvider(noisegen.random, 12, 0.2);
	
	function remapValUnsigned ( val ) {
		return (val + 1.0) * 0.5;
	}
	
	function remapValSigned ( val ) {
		return (val*2.0) - 1.0;
	}
 	
	// setup a canvas to hold the heightmap
	var canvas = document.createElement('canvas');
	canvas.id = "hm-canvas";
	canvas.height = 256;
	canvas.width = 256;
	document.body.appendChild(canvas);
	
	var ctx = canvas.getContext('2d')
	var id = ctx.createImageData(1,1);
	var d = id.data;
	
	var scale = 0.02;
	var octaves = 24;
	
	
	for (var x = 0; x < 256; x++) {
		for (var y = 0; y < 256; y++) {
			var _x = x * scale, _y = y * scale;
			var hgt = 0.0; 

				
			hgt += remapValUnsigned( hmGen.getHeightAt(_x,_y) );


			var pix = Math.floor( (hgt) * 256 );
			d[0] = d[1] = d[2] = pix;
			d[3] = 255;
			ctx.putImageData(id, x, y);
		}
	}
	
	
	
})(THREE);