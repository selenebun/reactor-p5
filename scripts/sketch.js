// Global variables
var canvas;


//////////////////////////////////
//  p5.js built-in functions    //
//////////////////////////////////

function setup() {
    var w = document.getElementById("sketch-container").offsetWidth;
    
    console.log(w);

    canvas = createCanvas(w, 400);
    canvas.parent('sketch-container');
}

function draw() {
    background(255, 0, 200);
}
