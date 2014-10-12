/**
 * @author Vildanov Almaz / alvild@gmail.com
 */

XYZLoader = function () {
    
	this.molecule = new THREE.Object3D();
    this.k = 0.4; // коэф. пропорциональности

    var atoms = [], materials = [], geometries = [];	
	var arr = [];

	this.load = function ( url ) {

		this.parseXYZ( url );
		return this.createModel();
		
	},

	// Based on CanvasMol PDB parser

	this.parseXYZ = function ( url ) {

		var sssr = this.file_get_contents( url );
		var info = sssr.split(/\n/);
		if (info[info.length - 1].length < 1) {
			info.pop();
		}

		// переводим info в массив вида [ [ 1, C, -0.231579, -0.350841, -0.037475, 1, 2, 4, 5, 6 ], [2, C, 0.229441...] ... ]
		for (var i = 1; i < info.length; i++) {
			arr[i - 1] = info[i].match(/\S+/g);
		}

		// например
		//0 - водород 1 - кислород  2 - углерод
		// название, цвет молекулы и ее размер в ангстремах
		//atoms['H'] = [ 0, 0x2a52be, 0.53]; 
		//atoms['O'] = [ 1, 0xff0000, 0.60];
		//atoms['C'] = [ 2, 0x00ff12, 0.91];

		var allAtomSymbol = '';
		var number = 0;
		for (var i = 0; i < arr.length; i++) {
			var AtomSymbol = String(arr[i][1]); //alert( AtomSymbol );
			var pos = allAtomSymbol.indexOf('#' + AtomSymbol + '#'); //console.log( allAtomSymbol + '_' + AtomSymbol + '_' + pos);
			if (pos < 0) {
				allAtomSymbol = allAtomSymbol + '#' + AtomSymbol + '#';
				if ( atoms[AtomSymbol] == undefined ) atoms[AtomSymbol] = [ number, Math.random() * 0xFFFFFF, 0.7 ];
				number++;
			}
		}

	},

	this.createModel = function () {

		for (var Name in atoms) {
			var material = new THREE.MeshPhongMaterial({
				color: atoms[Name][1],
				specular: 0x00b2fc,
				shininess: 12,
				blending: THREE.NormalBlending,
				depthTest: true
			});
			materials.push(material);
			var geometry = new THREE.SphereGeometry(atoms[Name][2] * this.k, 16, 16); // геометрия сферы
			geometries.push(geometry);
		}

		for (var i = 0; i < arr.length; i++) {
				var Name = arr[i][1]; // номер элемента
			//console.log( 'Name ' + Name )
			var Punct = new THREE.Mesh(geometries[atoms[Name][0]], materials[atoms[Name][0]]);
			Punct.position.set(arr[i][2], arr[i][3], arr[i][4]);
			this.molecule.add(Punct);
		}

		// связи 

		for (i = 0; i < arr.length; i++) {

			var num = arr[i][0] - 1; // номер атома

			var x1 = parseFloat(arr[num][2]);
			var y1 = parseFloat(arr[num][3]);
			var z1 = parseFloat(arr[num][4]);

			for (j = 6; j < arr[i].length; j++) {

				var num = arr[i][j] - 1; // номер атома
	
				var x2 = (parseFloat(arr[num][2]) + x1) / 2;
				var y2 = (parseFloat(arr[num][3]) + y1) / 2;
				var z2 = (parseFloat(arr[num][4]) + z1) / 2;


				var fingerLength = this.cylinderMesh(new THREE.Vector3(x1, y1, z1), new THREE.Vector3(x2, y2, z2));
				fingerLength.material = materials[atoms[arr[i][1]][0]];
				this.molecule.add(fingerLength);

			}
		}

		return this.molecule;

	}

	this.file_get_contents = function(url) {
		var req = null;
		try {
			req = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				req = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				try {
					req = new XMLHttpRequest();
				} catch (e) {}
			}
		}
		if (req == null) throw new Error('XMLHttpRequest not supported');

		req.open("GET", url, false);
		req.send(null);

		return req.responseText;
	}
	
	// http://stemkoski.github.io/Three.js/LeapMotion.html
	this.cylinderMesh = function( pointX, pointY ) {
		// edge from X to Y
		var direction = new THREE.Vector3().subVectors(pointY, pointX);

		var arrow = new THREE.ArrowHelper(direction.clone().normalize(), pointX, direction.length());

		// cylinder: radiusAtTop, radiusAtBottom, height, segmentsAroundRadius, segmentsAlongHeight
		var edgeGeometry = new THREE.CylinderGeometry(0.1, 0.1, direction.length(), 16, 4);

		var edgeMesh = new THREE.Mesh(edgeGeometry, new THREE.MeshBasicMaterial({
			color: 0x0000ff
		}));
		edgeMesh.position.copy(new THREE.Vector3().addVectors(pointX, direction.multiplyScalar(0.5)));

		edgeMesh.setRotationFromEuler(arrow.rotation);
		return edgeMesh;
	}

}


XYZLoader.prototype = {

	constructor: XYZLoader

}

