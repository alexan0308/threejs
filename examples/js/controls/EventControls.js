import {
	EventDispatcher,
	Matrix4,
	Plane,
	Raycaster,
	Vector2,
	Vector3
} from 'three';

const _raycaster = new Raycaster();

const _pointer = new Vector2();
const _offset = new Vector3(0,0,0);
const _intersection = new Vector3();
const _worldPosition = new Vector3();
const _inverseMatrix = new Matrix4();

class _Event {
  constructor() { 
    this.object = null;
	this.item = null;  
  }
}

class EventControls extends EventDispatcher {
  
	constructor( _objects, _camera, _domElement ) {

		super();

		_domElement.style.touchAction = 'none'; // disable touch scroll

		let _selected = null, _hovered = null;

		const _intersections = [];

		//

		const scope = this;

		//this.focused = null; // выделенный объект
		//this.mouseOvered = null; // наведенный объект  
        this.event = new _Event();
        this.orbitControl = null;
        this.map = null;
		this.previous = new Vector3(); // предыдущие координаты выделенного объекта
		this.offset = new Vector3(0,0,0);
      
		this._mouseOverFlag = false;
		this._mouseOutFlag = false;	
		this._dragAndDropFlag = false;	
		this._mouseUpFlag = false;
		this._onclickFlag = false;
		this._mouseMoveFlag = false;
      
		this.dragAndDrop = function () {}
		this.mouseOver = function () {}
		this.mouseOut = function () {}
		this.mouseUp = function () {}
		this.mouseMove = function () {}
		this.onclick = function () {}
        this.draggable = false;
      
		this.setMap = function ( map ){
			this.map = map;         
        }

		this.setOrbitControl = function ( control ) {
			this.orbitControl = control;         
        }
		this.setDraggable = function ( _render, flag ) {
			this.draggable = flag;
            if ( flag ) 
              this.addEventListener( 'drag', _render )
          	else 
              this.removeEventListener( 'drag', _render );
        }
      	this.attach = function ( object ) {
			_objects.push( object );
		}
        this.detach = function ( object ) {
            var item = _this.objects.indexOf( object );
            _objects.splice( item, 1 );
        }
		
		this.attachEvent = function ( event, handler ) {

          switch ( event ) {
              case 'mouseOver': 		this.mouseOver = handler; 		scope._mouseOverFlag = true;	break;
              case 'mouseOut': 			this.mouseOut = handler; 		scope._mouseOutFlag = true;		break;
              case 'dragAndDrop': 	    scope.dragAndDrop = handler; 	scope._dragAndDropFlag = true;	scope.enabled = true; break;
              //case 'mouseUp': 		this.mouseUp = handler; 		_mouseUpFlag = true;		break;
              case 'onclick': 			scope.onclick = handler; 		scope._onclickFlag = true;		break;
              //case 'mouseMove': 		this.mouseMove = handler; 		_mouseMoveFlag = true;		break;		
              break;
          }

		}      
      
		this.plane = new Plane( new Vector3( 0, 1, 0 ) );
       // this.plane.translate ( new Vector3( 0, 200, 0 ) );
      
		function activate() {

			_domElement.addEventListener( 'pointermove', onPointerMove );
			_domElement.addEventListener( 'pointerdown', onPointerDown );
			_domElement.addEventListener( 'pointerup', onPointerCancel );
			_domElement.addEventListener( 'pointerleave', onPointerCancel );

		}

		function deactivate() {

			_domElement.removeEventListener( 'pointermove', onPointerMove );
			_domElement.removeEventListener( 'pointerdown', onPointerDown );
			_domElement.removeEventListener( 'pointerup', onPointerCancel );
			_domElement.removeEventListener( 'pointerleave', onPointerCancel );

			_domElement.style.cursor = '';

		}

		function dispose() {

			deactivate();

		}
      
		function getObjects() {

			return _objects;

		}

		function getRaycaster() {

			return _raycaster;

		}

		function onPointerMove( event ) {

			//if ( scope.enabled === false  ) return;
			if ( scope._mouseOverFlag === false && scope._dragAndDropFlag === false && scope.draggable === false) return;
			updatePointer( event );

			if ( scope.draggable || scope._dragAndDropFlag ) {
            _raycaster.setFromCamera( _pointer, _camera );
          
                // <!-- enabled orbitcontrols
                  if ( scope.orbitControl ) {
					  if ( _raycaster.intersectObject( scope.map, false ).length > 0 ) {
						scope.orbitControl.enabled = false; 
						scope.orbitControl.saveState();
					  }
                      else {
                          if ( scope.orbitControl.enabled == false ) {
                            scope.orbitControl.reset();
                            scope.orbitControl.enabled = true;
                          }
                     }
				  }                    
                // enabled orbitcontrols -->
          
			if ( _selected ) {

				if ( _raycaster.ray.intersectPlane( scope.plane, _intersection ) ) {
                  if (!scope.map) { 
					_selected.position.copy( _intersection.sub( _offset ).applyMatrix4( _inverseMatrix ) ); //.sub( scope.offset ) ); //_selected.position.y = scope.previous.y;
                    scope.dragAndDrop();
                  } else if 
                    ( _raycaster.intersectObject( scope.map, false ).length > 0 ) {
                      _selected.position.copy( _intersection.sub( _offset ).applyMatrix4( _inverseMatrix ) ); //.sub( scope.offset ) ); //_selected.position.y = scope.previous.y;
                      scope.dragAndDrop(); 
                    }
                  //_offset.x =  _offset.x * 0.9; _offset.z =  _offset.z * 0.9;
                  _domElement.style.cursor = 'move';
				}

				scope.dispatchEvent( { type: 'drag', object: _selected } );
                //_move( _selected );

				return;
              }
			}

			// hover support

			if ( event.pointerType === 'mouse' || event.pointerType === 'pen' ) {

				_intersections.length = 0;

				_raycaster.setFromCamera( _pointer, _camera );
				_raycaster.intersectObjects( _objects, true, _intersections );

				if ( _intersections.length > 0 ) {

					const object = _intersections[ 0 ].object;
                    
					//scope.plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( scope.plane.normal ), _worldPosition.setFromMatrixPosition( object.matrixWorld ) );

					if ( _hovered !== object && _hovered !== null ) {
                      
                        if ( scope._mouseOutFlag ) { 
                       		scope.event.object = _hovered; scope.mouseOut(); 
                    	}
						scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );

						_domElement.style.cursor = 'auto';
						_hovered = null;

					}

					if ( _hovered !== object ) {

						scope.dispatchEvent( { type: 'hoveron', object: object } );
						_domElement.style.cursor = 'pointer';
						_hovered = object;
                		scope.event.item = _objects.indexOf( _hovered );
					}
                 
                    if ( scope._mouseOverFlag ) { 
                       scope.event.object =_hovered; scope.mouseOver(); 
                    }

				} else {

					if ( _hovered !== null ) {

                        if ( scope._mouseOutFlag ) { 
                       		scope.event.object = _hovered; scope.mouseOut(); 
                    	}
						scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );

						_domElement.style.cursor = 'auto';
						_hovered = null;

					}

				}

			}

		}

		function onPointerDown( event ) {

			//if ( scope.enabled === false ) return;

			updatePointer( event );

			_intersections.length = 0;

			_raycaster.setFromCamera( _pointer, _camera );
			_raycaster.intersectObjects( _objects, true, _intersections );

			if ( _intersections.length > 0 ) {

				_selected = ( scope.transformGroup === true ) ? _objects[ 0 ] : _intersections[ 0 ].object;
				if ( _selected.parent.isGroup  ) {
					_selected = _selected.parent;
                }
                scope.previous.copy( _selected.position );
                scope.offset.set(0,0,0);
                let pos = new Vector3().copy( _selected.position );
               // if ( _raycaster.ray.intersectPlane( scope.plane, _intersection ) )
                //	scope.offset.subVectors( _intersection, pos );
				//scope.offset.y = 0;
              
				//scope.plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( scope.plane.normal ), _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );

				if ( _raycaster.ray.intersectPlane( scope.plane, _intersection ) ) {
					_inverseMatrix.copy( _selected.parent.matrixWorld ).invert();
					_offset.copy( _intersection ).sub( _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );

				}

              if ( scope.draggable ) {
				_domElement.style.cursor = 'move';
				scope.dispatchEvent( { type: 'dragstart', object: _selected } );
              }
                scope.event.object = _selected;
                scope.event.item = _objects.indexOf( _selected );
                if ( scope._onclickFlag ) scope.onclick();

			}

          else { scope.event.object = null; scope.event.item = null; }


		}

		function onPointerCancel() {

			//if ( scope.enabled === false ) return;
            if (  scope.draggable === false ) return;

			if ( _selected ) {

				scope.dispatchEvent( { type: 'dragend', object: _selected } );

				_selected = null;
                scope.event.object = null; scope.event.item = null;

			}

			_domElement.style.cursor = _hovered ? 'pointer' : 'auto';

		}

		function updatePointer( event ) {

			const rect = _domElement.getBoundingClientRect();

			_pointer.x = ( event.clientX - rect.left ) / rect.width * 2 - 1;
			_pointer.y = - ( event.clientY - rect.top ) / rect.height * 2 + 1;

		}

		activate();

		// API

		this.enabled = false;
		this.transformGroup = false;

		this.activate = activate;
		this.deactivate = deactivate;
		this.dispose = dispose;
		this.getObjects = getObjects;
		this.getRaycaster = getRaycaster;

	}

}

export { EventControls };
