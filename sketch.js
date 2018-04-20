var database;

var drawing = [];
var currentPath = [];
var isDrawing = false;

function setup() {
    var config = {
        // TODO: Replace with your Firebase config
        apiKey: "#######################################",
        authDomain: "############.firebaseapp.com",
        databaseURL: "https://############.firebaseio.com",
        projectId: "############",
        storageBucket: "############.appspot.com",
        messagingSenderId: "############"
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

    var ref = database.ref("drawings");
    ref.on('value', gotData, errData);

    var params = getURLParams();
    console.log(params);

    if (params.id) {
        showDrawing(params.id);
    }
    else if (params.deleteid) {
        deleteDrawing(params.deleteid);
    }
}

function startPath() {
    isDrawing = true;
    currentPath = [];
    drawing.push(currentPath);
}

function endPath() {
    isDrawing = false;
}

function draw() {
    background(0);

    if (isDrawing) {
        var point = { x: mouseX, y: mouseY};
        currentPath.push(point);
    }

    stroke(255);
    strokeWeight(4);
    noFill();

    var b = false;
    for (var i = 0; i < drawing.length; i++) {
        beginShape();
    
        var path = drawing[i];
        for (var j = 0; j < path.length; j++) {
            vertex(path[j].x, path[j].y);
        }
        endShape();
    }
}

function saveDrawing() {
    var ref = database.ref("drawings");

    var currentdate = new Date(); 
    var datetime = currentdate.getFullYear() + "-" + (currentdate.getMonth()+1) + "-"  + currentdate.getDate()
        + " " + currentdate.getHours() + ":" + currentdate.getMinutes();
    var data = {
        name: datetime,
        drawing: drawing
    };
    ref.push(data, dataSent);

    function dataSent(status) {
        console.log(status);
    }
}

function clearDrawing() {
    drawing = [];
}

function gotData(data) {
    var elts = selectAll('.listing');
    for (var i = 0; i < elts.length; i++) {
        elts[i].remove();
    }
    var drawings = data.val();
    var keys = Object.keys(drawings);

    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var li = createElement('li', '');
        li.class('listing');

        var ref = database.ref('drawings/' + key);
        ref.once('value', oneDrawingName, errData);

        var datetime;
        function oneDrawingName(data) {
            datetime = data.val().name;
        }

        var ahref = createA('?id=' + key, datetime);
        ahref.mousePressed(showDrawing);
        ahref.parent(li);
        li.parent('drawingList');

        var permalink = createA('?id=' + key, 'Share');
        permalink.parent(li);
        permalink.style('padding', '4px');

        var dellink = createA('?deleteid=' + key, 'Delete');
        dellink.parent(li);
        dellink.style('padding', '4px');
    }
}

function errData(err) {
    console.log(err);
}

function showDrawing(key) {
    if (key instanceof MouseEvent)
        key = this.html();

    var ref = database.ref('drawings/' + key);
    ref.once('value', oneDrawing, errData);

    function oneDrawing(data) {
        var dbDrawing = data.val();
        drawing = dbDrawing.drawing;
    }
}

function deleteDrawing(key) {
    database.ref('drawings/' + key).remove();
}
