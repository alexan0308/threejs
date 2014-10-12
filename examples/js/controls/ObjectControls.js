 /** This DisplaceControl will allow to facilitate development speed for simple manipulations by means of a mouse
 * - a clique, pointing, movement.
 * @author Vildanov Almaz / alvild@gmail.com
 */

ObjectControls = function ( camera, domElement ) {

	var _this = this;

	this.camera = camera;
	this.container = ( domElement !== undefined ) ? domElement : document;
	this.fixed = new THREE.Vector3( 0, 0, 0 );
	this.displacing = true;
	
	var _DisplaceFocused = null; // выделенный мэш
	this.focused = null; // выделенный мэш
	this.focusedpart = null; // выделенная часть 3D объекта	
	var _DisplaceMouseOvered = null; // выделенный мэш	
	this.mouseovered = null; // наведенный мэш
	this.mouseoveredpart = null; // наведенная часть 3D объекта	
	
	this.projectionMap = null;
	this._mouse = new THREE.Vector2();
	this._projector = new THREE.Projector();

	// API

	this.enabled = true;
	this.item = null;

	this.objects = [];
	this._intersects = [];
	this.intersectsMap;	
	this.previous = new THREE.Vector3( 0, 0, 0 );

	this.update = function () { 
		onContainerMouseMove();
	}

	this.move = function () { this.container.style.cursor = 'move' }
	this.mouseover = function () { this.container.style.cursor = 'pointer' }
	this.mouseout = function () { this.container.style.cursor = 'auto' }
	this.mouseup = function () { this.container.style.cursor = 'auto' }
	this.onclick = function () {}

	this.returnPrevious = function() {

		this._selGetPos( this.previous );

	}
	this.attach = function ( object ) {

		if ( object instanceof THREE.Mesh ) { 
			this.objects.push( object );
		}
		else {

			this.objects.push( object );

			for ( var i = 0; i < object.children.length; i++ ) {
				object.children[i].userData.parent = object;		
			}
		}

	}

	this.detach = function ( object ) {

		var item = this.objects.indexOf( object );
		this.objects.splice( item );

	}

	this.setfocus = function ( object ) {

		_DisplaceFocused = object;
		_this.item = _this.objects.indexOf( object );		
		if ( object.userData.parent ) { // console.log( ' select object3D ' );
			this.focused = object.userData.parent;
			this.focusedpart = _DisplaceFocused;
			this.previous.copy( this.focused.position );
		}
		else { //console.log( ' select mesh ' );
			this.focused = object; this.focusedpart = null;
			this.previous.copy( this.focused.position );
		}

	}
	
	this._setFocusNull = function () {
		_DisplaceFocused = null;
		this.focused = null;
		this.focusedpart = null;
		this.item = null;
	}
	
	this.select = function ( object ) {

		_DisplaceMouseOvered = object;
		if ( object.userData.parent ) { // console.log( ' select object3D ' );
			this.mouseovered = object.userData.parent;
			this.mouseoveredpart = _DisplaceMouseOvered;
		}
		else { //console.log( ' select mesh ' );
			this.mouseovered = object; this.mouseoveredpart = null;
		}

	}
	
	this._setSelectNull = function () {
		_DisplaceMouseOvered = null;
		this.mouseovered =  null;
		this.mouseoveredpart = null;
	}

	this._selGetPos = function( a ) {

		this.focused.position.copy( a ); //console.log( this.focused.position );
	}

	this._rayGet = function () {

		var vector = new THREE.Vector3( _this._mouse.x, _this._mouse.y, 0.5 );
		this._projector.unprojectVector( vector, camera ); //vector.unprojectVector( this.camera );
		var raycaster = new THREE.Raycaster( this.camera.position, vector.sub( this.camera.position ).normalize() );
		return raycaster;

	}

	function getMousePos( event ) {

		var x = event.offsetX == undefined ? event.layerX : event.offsetX;
		var y = event.offsetY == undefined ? event.layerY : event.offsetY;

		_this._mouse.x = ( ( x ) / _this.container.width ) * 2 - 1;
		_this._mouse.y = - ( ( y ) / _this.container.height ) * 2 + 1;

		var vector = new THREE.Vector3( _this._mouse.x, _this._mouse.y, 0.5 );
		return vector;

	}

	function onContainerMouseDown( event ) {

		var raycaster = _this._rayGet();
		_this._intersects = raycaster.intersectObjects( _this.objects, true );

		if ( _this._intersects.length > 0 ) {

			_this.setfocus( _this._intersects[ 0 ].object );
			_this.onclick();

		}
		else {
			_this._setFocusNull();
		}

	}

	function onContainerMouseMove() {

		var raycaster = _this._rayGet();

		if ( _this.focused ) {
		if ( _this.displacing ) {

			_this.intersectsMap = raycaster.intersectObject( _this.projectionMap );

			try {
				var pos = new THREE.Vector3().copy( _this.intersectsMap[ 0 ].point );				
				if ( _this.fixed.x == 1 ) { pos.x = _this.previous.x };
				if ( _this.fixed.y == 1 ) { pos.y = _this.previous.y };
				if ( _this.fixed.z == 1 ) { pos.z = _this.previous.z };				
				_this._selGetPos( pos );
			}
			catch( err ) {}

			_this.move(); _this._selGetPos( _this.focused.position );
		}
		}
		else {

			_this._intersects = raycaster.intersectObjects( _this.objects, true );
			if ( _this._intersects.length > 0 ) {			
				if ( _this.mouseovered ) {  // какая-то клавиша уже была наведена
					if ( _DisplaceMouseOvered != _this._intersects[ 0 ].object ) {
						_this.mouseout();
						_this.select( _this._intersects[ 0 ].object );
						_this.mouseover();
					}
					else _this.mouseover();
				}
				else {
					_this.select( _this._intersects[ 0 ].object );
					_this.mouseover();
				}
			}
			else {
				if ( _DisplaceMouseOvered ) { _this.mouseout(); _this._setSelectNull(); }
			}

		}

	}


	function onContainerMouseUp( event ) {

		event.preventDefault();

			if ( _this.focused ) {

				_this.mouseup();
                _DisplaceFocused = null;
				_this.focused = null; 

			}

	}

	this.container.addEventListener( 'mousedown', onContainerMouseDown, false );	// мышка нажата
	this.container.addEventListener( 'mousemove', getMousePos, false );   // получение координат мыши
	this.container.addEventListener( 'mouseup', onContainerMouseUp, false );       // мышка отпущена

};

//ObjectControls.prototype = Object.create( THREE.EventDispatcher.prototype );
