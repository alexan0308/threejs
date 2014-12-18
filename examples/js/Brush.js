
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

	draw: function ( mesh, point ) {

		// faces are indexed using characters

		if ( point == undefined ) {

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

			for ( var f = 0, fl = mesh.geometry.faces.length; f < fl; f ++ ) {

				var face = mesh.geometry.faces[ f ];

				if ( face instanceof THREE.Face3 ) {

					distanceA = point.distanceToSquared( mesh.geometry.vertices[ face.a ] );
					distanceB = point.distanceToSquared( mesh.geometry.vertices[ face.b ] );				
					distanceC = point.distanceToSquared( mesh.geometry.vertices[ face.c ] );

					if ( distanceA < this.size * this.size || distanceB < this.size * this.size || distanceC < this.size * this.size  ) { 
						face.color = this.color; 
					
						numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
							for( var j = 0; j < numberOfSides; j++ ) {
								vertexIndex = face[ this._faceIndices[ j ] ];
								face.vertexColors[ j ] = this.color;
								//console.log( f + ' ' + j );
							}						
					
					} 
					//console.log( 'face.a = ' + intersects[ 0 ].object.geometry.vertices[ face.a ].x );
					//console.log( 'point.distanceToSquared( face.a ) = ' +  point.distanceToSquared( intersects[ 0 ].object.geometry.vertices[ face.a ] ) );
				}
			}
		
			mesh.geometry.colorsNeedUpdate = true;		
		}

	}

}