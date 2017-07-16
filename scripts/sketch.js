//////////////////////
// Configuration    //
//////////////////////

// Rendering
const CELLSIZE = 20;            // length of each side of a cell
const NSIZE = 10;               // diameter of neutrons
const CANVAS_HEIGHT = 400;      // height of canvas

// Functionality
const ABSORBER_CHANCE = 5;      // chance for an absorber to absorb a neutron

const FUEL_ABSORB_CHANCE = 5;   // chance for a fuel cell to absorb a neutron
const N_SPONT_CHANCE = 0.25;    // spontaneous neutron emission chance
const NSPAWN_MIN = 1;           // Min number of neutrons from reaction
const NSPAWN_MAX = 3;           // Max number of neutrons from reaction

const NSPEED_MIN = 1;           // Min neutron speed
const NSPEED_MAX = 10;          // Max neutron speed


// Global variables
var canvas;

var cols;
var rows;

var grid;
var neutrons;

var selected;


//////////////////////////////
//  Resetting simulation    //
//////////////////////////////


function initCanvas() {
    var w = document.getElementById("sketch-container").offsetWidth;
    canvas = createCanvas(w, CANVAS_HEIGHT);
    canvas.parent("sketch-container");
}

function initGrid() {
    cols = floor(width / CELLSIZE);
    rows = floor(height / CELLSIZE);

    grid = new Array(cols);
    for (var i = 0; i < cols; i++) {
        grid[i] = new Array(rows);
    }
}

function initNeutrons() {
    neutrons = [];
}

// Fill board with empty tiles
function placeTiles() {
    for (var x = 0; x < cols; x++) {
        for (var y = 0; y < rows; y++) {
            grid[x][y] = new Tile(x, y);
        }
    }
}

// Creates a jumble of random cells
function randomReactor() {
    for (var x = 0; x < cols; x++) {
        for (var y = 0; y < rows; y++) {
            var r = round(random(3));
            if (r === 0) {
                grid[x][y] = new Moderator(x, y);
            } else if (r === 1) {
                grid[x][y] = new Absorber(x, y);
            } else if (r === 2) {
                grid[x][y] = new Reflector(x, y);
            } else if (r === 3) {
                grid[x][y] = new Fuel(x, y);
            }
        }
    }
}


//////////////////////////////
//  Misc. custom functions  //
//////////////////////////////


// Find the nearest tile
function currentTile(x, y) {
    return {
        x: floor(x / CELLSIZE),
        y: floor(y / CELLSIZE)
    };
}

// Create a glowing effect
function glow(x, y, diameter, color) {
    for (var i = 0; i < 10; i++) {
        fill(color.r, color.g, color.b, round(255/10));
        noStroke();
        ellipse(x, y, (diameter/10)*(i+1), (diameter/10)*(i+1));
    }
}

function updateMonitor() {
    ncount = document.getElementById("ncount");
    ncount.innerHTML = "Neutron count: " + neutrons.length;
}

function plusOrMinus() {
    return round(random()) * 2 - 1;
}

function removeNeutron(n) {
    var index = neutrons.indexOf(n);

    if (index > -1) {
        neutrons.splice(index, 1);
    }
}


//////////////////////////////////
//  p5.js built-in functions    //
//////////////////////////////////


function setup() {
    initCanvas();
    initGrid();
    initNeutrons();

    randomReactor();
}

function draw() {
    background(242, 241, 239);

    for (var x = 0; x < cols; x++) {
        for (var y = 0; y < rows; y++) {
            grid[x][y].update();
            grid[x][y].display();
        }
    }

    for (var i = 0; i < neutrons.length; i++) {
        neutrons[i].update();
        if (neutrons[i].checkEdges()) {
            removeNeutron(neutrons[i]);
            continue;
        }

        var c = currentTile(neutrons[i].pos.x, neutrons[i].pos.y);
        if (grid[c.x][c.y].onReact(neutrons[i])) {
            continue;
        }

        neutrons[i].display();
    }

    updateMonitor();
}

function keyPressed() {
    switch (keyCode) {
        case 65:
            selected = "a";
            break;
        case 66:
            selected = "b";
            break;
        case 70:
            selected = "f";
            break;
        case 77:
            selected = "m";
            break;
        case 78:
            selected = "n";
            break;
        case 82:
            selected = "r";
            break;
        case 84:
            selected = "t";
            break;
        case 86:
            // toggle variable editor
            break;
        case 88:
            initGrid();
            initNeutrons();

            placeTiles();
    }
}

function mouseDragged() {
    var c = currentTile(mouseX, mouseY);

    switch (selected) {
        case "a":
            grid[c.x][c.y] = new Absorber(c.x, c.y);
            break;
        case "b":
            // TODO
            break;
        case "f":
            grid[c.x][c.y] = new Fuel(c.x, c.y);
            break;
        case "m":
            grid[c.x][c.y] = new Moderator(c.x, c.y);
            break;
        case "n":
            neutrons.push(new Neutron(mouseX, mouseY));
            break;
        case "r":
            grid[c.x][c.y] = new Reflector(c.x, c.y);
            break;
        case "t":
            grid[c.x][c.y] = new Tile(c.x, c.y);
    }
}

// Fit grid to screen
function windowResized() {
    var w = document.getElementById("sketch-container").offsetWidth;
    resizeCanvas(w, CANVAS_HEIGHT);

    initGrid();
    initNeutrons();

    randomReactor();
}
