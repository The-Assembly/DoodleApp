var database;
var drawing = [];
var currentPath = [];

var isDrawing = false;

function setup() {
  var config = {
    apiKey: "AIzaSyDXyCfcZ63k4E0oXY1P0vbpDUiRPISuv34",
    authDomain: "doodler-9a484.firebaseapp.com",
    databaseURL: "https://doodler-9a484.firebaseio.com",
    projectId: "doodler-9a484",
    storageBucket: "doodler-9a484.appspot.com",
    messagingSenderId: "612644588928"
  };
  
	firebase.initializeApp(config);
  	database = firebase.database();

	canvas = createCanvas(screen.width * 0.95, screen.height * 0.5);
	canvas.parent('canvascontainer');

	canvas.mousePressed(startPath);
	canvas.mouseReleased(endPath);

	var saveButton = select('#saveButton');
	saveButton.mousePressed(saveDrawing);

	var clearButton = select('#clearButton');
	clearButton.mousePressed(clearDrawing);

	var params = getURLParams();
	console.log(params);
	if (params.id) {
		showDrawing(params.id);
	} else if(params.deleteid) {
		deleteDrawing(params.deleteid);
	}
	
	var p = createElement('p', 'Loading...');
	p.class('loading');
	p.parent('drawingList');

	var ref = database.ref("drawings");
	ref.on('value', gotData, errData);
}

function startPath() {
	isDrawing = true;
	currentPath = [];
	drawing.push(currentPath);
}

function endPath() {
	isDrawing = false;
}

function draw(){
	background(0);

	if (isDrawing)
	{
		var point = {
			x: mouseX,
			y: mouseY
		}

		currentPath.push(point);
	}

	stroke(255);
	strokeWeight(4);
	noFill();
	for(var i = 0; i < drawing.length; i++){
		var path = drawing[i];
		beginShape();
		for(var j = 0; j < path.length; j++){
			vertex(path[j].x, path[j].y)
		}
		endShape();
	}
}

function saveDrawing() {
	var ref = database.ref("drawings");
	var data = {
		name: "The Assembly",
		drawing: drawing
	}
	
	ref.push(data, dataSent);

	function dataSent(status) {
		console.log(status)
	}
}

function gotData(data) {	
	var elts = selectAll('.listing');
	var elts2 = selectAll('.loading');
	if(elts2.length > 0) {
		elts2[0].remove();
	}
	
	for(var i = 0; i < elts.length; i++) {
		elts[i].remove();
	}

	var drawings = data.val();
	var keys = Object.keys(drawings);
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		var li = createElement('li', '');
		li.class('listing');
		var ahref = createA('#', key);
		ahref.mousePressed(showDrawing);
		ahref.parent(li);
		li.parent('drawingList');

		var perma = createA('?id=' + key, 'Share');
		perma.parent(li);
		perma.class('share');
		perma.style('padding','4px');
	
		var perma2 = createA('?deleteid=' + key, 'Delete');
		perma2.parent(li);
		perma2.class('delete');
		perma2.style('padding','4px');

	}
}

function errData(err) {
	console.log(err);
}

function showDrawing(key) {
	if(key instanceof MouseEvent){
		key = this.html();
	}
    var ref = database.ref('drawings/' + key);
    ref.once('value', oneDrawing, errData);
	
	function oneDrawing(data) {
		var dbdrawing = data.val();
		drawing = dbdrawing.drawing;
	}
}

function clearDrawing() {
	drawing = [];
}

function deleteDrawing(key) {
	var ref = database.ref(`drawings/${key}`).remove();
}
