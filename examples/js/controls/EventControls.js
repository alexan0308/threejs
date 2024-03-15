 /** This EventControls will allow to facilitate development speed for simple manipulations by means of a mouse
 * - point and click, drag and drop.
 * @author Vildanov Almaz / alvild@gmail.com
 *  version 15.03.2024.
 */

import {
	EventDispatcher,
	Matrix4,
	Plane,
	Raycaster,
	Vector2,
	Vector3,
	Box3,
	Mesh
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
        this.collisions = null;	// array Box3
        this.precision = 1;	// array Box3		

        this.map = null;
		this.previous = new Vector3(); // предыдущие координаты выделенного объекта
		this.offset = new Vector3(0,0,0);
		this._DisplaceIntersectsMap = [];	
      
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
              case 'mouseOut': 			this.mouseOut = handler; 		scope._mouseOutFlag = true;	break;
              case 'dragAndDrop': 	    scope.dragAndDrop = handler; 	scope._dragAndDropFlag = true;	scope.enabled = true; break;
              case 'mouseUp': 		scope.mouseUp = handler; 		scope._mouseUpFlag = true;		break;
              case 'click': 			scope.onclick = handler; 		scope._onclickFlag = true;		break;
              //case 'mouseMove': 		this.mouseMove = handler; 		_mouseMoveFlag = true;		break;		
              break;
          }

		}

        this.addCollisions = function ( objects, precision ) {
			scope.precision = precision;
			scope.collisions = [];
			let _obj = null;
			for (let i=0; i<objects.length; i++) {
				_obj = objects[i].clone();	
				_obj.scale.x = precision; _obj.scale.y = precision; _obj.scale.z = precision;
				let Box = new Box3().setFromObject(_obj);
				scope.collisions.push( Box );
			}
			_obj = null;
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
					  if ( _raycaster.intersectObject( scope.map ).length > 0 ) {
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
/*
				if ( _raycaster.ray.intersectPlane( scope.plane, _intersection ) ) {
                  if (!scope.map) { console.log( "!scope.map" );
					_selected.position.copy( _intersection.sub( _offset ).applyMatrix4( _inverseMatrix ) ); //.sub( scope.offset ) ); //_selected.position.y = scope.previous.y;
                    scope.dragAndDrop(); 
                  } else if 
                    ( _raycaster.intersectObject( scope.map, false ).length > 0 ) { console.log( "scope.map" );
                      _selected.position.copy( _intersection.sub( _offset ).applyMatrix4( _inverseMatrix ) ); //.sub( scope.offset ) ); //_selected.position.y = scope.previous.y;
                      scope.dragAndDrop(); 
                    }
                  //_offset.x =  _offset.x * 0.9; _offset.z =  _offset.z * 0.9;
                  _domElement.style.cursor = 'move';
				}
*/				
				scope._DisplaceIntersectsMap = _raycaster.intersectObject( scope.map );
				if ( scope._DisplaceIntersectsMap.length > 0 ) {
				
				   // console.log( _offset );
					scope.previous.copy( _selected.position );
					//console.log( "Pre", scope.previous );
					
					let newPos = new Vector3(0,0,0).copy( scope._DisplaceIntersectsMap[ 0 ].point.sub( _offset ).applyMatrix4( _inverseMatrix ) );
						
					_selected.position.copy( newPos );
						//if ( scope.collisions ) scope.collisions[ scope.event.item ].copy( _selected.geometry.boundingBox ).applyMatrix4( _selected.matrixWorld ); 					
					//console.log( "New", newPos );					
					scope.flag_collision = false;
					if ( scope.collisions ) {	
						//let bb = scope.collisions[ scope.event.item ];
						let bb = new Box3().setFromObject( _selected );						
							for (let i=0; i<scope.collisions.length; i++) {
								
								if ( i==scope.event.item) continue;
								let other = scope.collisions[ i ];
								//let other = new Box3().setFromObject( scope.collisions[i] );
								if (bb.intersectsBox(other)) {
									scope.flag_collision = true;
									//console.log( "intersext" ); 
									_selected.position.copy( scope.previous );
										//scope.collisions[ scope.event.item ] = scope.collisions[ scope.event.item ].copy( _selected.geometry.boundingBox ).applyMatrix4( _selected.matrixWorld ); 
									continue;
									//this.event.object.position.copy( this.previous );
								}
							} 
						//	if ( scope.flag_collision ) {
								//_selected.position.copy( scope.previous ); 
								//console.log( scope.collisions[scope.event.item] );						
							//}	
							
					}	
						scope.dragAndDrop(); 					

                   // _selected.position.copy( scope._DisplaceIntersectsMap[ 0 ].point.applyMatrix4( _inverseMatrix ) );			   
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
/*
				if ( _raycaster.ray.intersectPlane( scope.plane, _intersection ) ) {
					_inverseMatrix.copy( _selected.parent.matrixWorld ).invert();
					_offset.copy( _intersection ).sub( _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );
				}
	*/			
				scope._DisplaceIntersectsMap = _raycaster.intersectObject( scope.map );
				if ( scope._DisplaceIntersectsMap.length > 0 ) {
				
				   // console.log( _offset );
                    _offset.copy( scope._DisplaceIntersectsMap[ 0 ].point.applyMatrix4( _inverseMatrix ) ).sub( _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) ); 
                   // _selected.position.copy( scope._DisplaceIntersectsMap[ 0 ].point.applyMatrix4( _inverseMatrix ) ); 					
					//scope.dragAndDrop(); 
					//_domElement.style.cursor = 'move';
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
				scope.mouseUp();			
					if ( scope.collisions ) {	
						let _obj = _selected.clone()
						_obj.scale.x = scope.precision; _obj.scale.y = scope.precision; _obj.scale.z = scope.precision;
						scope.collisions[ scope.event.item ] = new Box3().setFromObject(_obj);
						_obj = null;
					}
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
