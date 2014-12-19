
THREE.Brush = function ( color, size ) {

	this.color = ( color !== undefined ) ? color : new THREE.Color( 0xffffff );
	this.size = ( size !== undefined ) ? size : 1;
	this._faceIndices = [ 'a', 'b', 'c', 'd' ];

}

THREE.Brush.prototype = {

	setColor: function ( color ) {

		this.color = color;

	},

	setSize: function ( size ) {

		this.size = size;

	},

    constructor: THREE.Brush,

	draw: function ( mesh, intersectedPoint, intersectedFace ) {

		// faces are indexed using characters

		if ( intersectedPoint == undefined ) {

			for ( var f = 0, fl = mesh.geometry.faces.length; f < fl; f ++ ) {

				var face = mesh.geometry.faces[ f ];
				if ( mesh.material.vertexColors == THREE.FaceColors) { face.color = this.color; continue; }
				if ( mesh.material.vertexColors == THREE.VertexColors) {
					numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
					for ( var j = 0; j < numberOfSides; j++ ) {
						vertexIndex = face[ this._faceIndices[ j ] ];
						face.vertexColors[ j ] = this.color;
						//console.log( f + ' ' + j );
					}
				}
			}

			mesh.geometry.colorsNeedUpdate = true;
		}

		else {

			var sizeSquared =  this.size * this.size;
			for ( var f = 0, fl = mesh.geometry.faces.length; f < fl; f ++ ) {

				var face = mesh.geometry.faces[ f ];

				scalarProduct = face.normal.dot( intersectedFace.normal );
				//	console.log( scalarProduct );				
				if ( scalarProduct <= 0 ) continue;

				numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
				var flagDistance = false;
				for ( var j = 0; j < numberOfSides; j++ ) {
					vertexIndex = face[ this._faceIndices[ j ] ];
					distance = intersectedPoint.distanceToSquared( mesh.geometry.vertices[ vertexIndex ] );
					if ( distance < sizeSquared ) { flagDistance = true; continue;}
				}

				if ( face === intersectedFace ) { flagDistance = true; }				
				if ( flagDistance ) {
					if ( mesh.material.vertexColors == THREE.FaceColors) {
						face.color = this.color; }

					else {

						if ( mesh.material.vertexColors == THREE.VertexColors) {
							for ( var j = 0; j < numberOfSides; j++ ) {
								vertexIndex = face[ this._faceIndices[ j ] ];
								face.vertexColors[ j ] = this.color;
								// console.log( f + ' ' + j );
							}
						}
					}
					mesh.geometry.colorsNeedUpdate = true;
				}
			}
		}
	
	}

}