//////////////////////////
//  Global variables    //
//////////////////////////


// Configuration
const CONFIG = {
    absorberChance: 25,     // chance for absorber to absorb a neutron
    absorberCool: 2,        // absorber cooling per tick
    absorberHeat: 2,        // heat generated per collision
    controlRodChance: 50,   // chance for control rod to absorb a neutron
    controlRodCool: 2,      // control rod cooling per tick
    controlRodHeat: 4,      // heat generated per collision
    coolantCool: 80,        // coolant cell cooling per tick
    fuelAbsorbChance: 5,    // chance for fuel cell to absorb a neutron
    fuelCool: 1,            // fuel cell cooling per tick
    fuelHeat: 20,           // heat generated per reaction
    fuelReactChance: 100,   // chance for fuel cell to react
    fuelSpontChance: 5,     // chance for spontaneous neutron emission
    fuelSpontHeat: 2,       // heat generated per spontaneous neutron emission
    heatMax: 100,          // maximum allowed heat
    heatTransfer: 0.02,     // percent of heat transferred to adjacent tiles
    moderatorCool: 10,      // moderator cooling per tick
    nCardDir: false,        // neutrons only travel in cardinal directions
    nSpawnMin: 1,           // min number of neutrons per reaction
    nSpawnMax: 3,           // max number of neutrons per reaction
    nSpeedMin: 1,           // min neutron speed
    nSpeedMax: 10,          // max neutron speed
    reflectorCool: 1,       // reflector cooling per tick
    reflectorHeat: 1,       // heat generated per reflection
    renderGlow: true,       // render glow effect
    wallCool: 1000000       // wall cooling per tick
};

const RENDER = {
    cellSize: 20,       // height and width of each cell
    nSize: 10,          // diameter of each neutron
    gLayers: 5,         // number of layers for glow effect
    gSize: 60,          // diameter of glow effect
    canvasHeight: 400   // height of canvas
};


// Misc.
var canvas;

var cols;
var rows;

var grid;
var neutrons;

var selected;

var controlRods = false;
var heatOverlay = false;


//////////////////////////////
//  Resetting simulation    //
//////////////////////////////


function initCanvas() {
    var w = document.getElementById("sketch-container").offsetWidth;
    canvas = createCanvas(w, RENDER.canvasHeight);
    canvas.parent("sketch-container");
}

function initGrid() {
    cols = floor(width / RENDER.cellSize);
    rows = floor(height / RENDER.cellSize);

    grid = new Array(cols);
    for (var i = 0; i < cols; i++) {
        grid[i] = new Array(rows);
    }
}

function initNeutrons() {
    neutrons = [];
}

// Fill board with moderator
function fillModerator() {
    for (var x = 0; x < cols; x++) {
        for (var y = 0; y < rows; y++) {
            grid[x][y] = new Moderator(x, y);
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
        x: floor(x / RENDER.cellSize),
        y: floor(y / RENDER.cellSize)
    };
}

// Create a glowing effect
function glow(x, y, color) {
    if ((CONFIG.renderGlow) && !(heatOverlay)) {
        for (var i = 0; i < RENDER.gLayers; i++) {
            fill(color.r, color.g, color.b, round(255/RENDER.gLayers));
            noStroke();
            ellipse(x, y, (RENDER.gSize/RENDER.gLayers)*(i+1),
                    (RENDER.gSize/RENDER.gLayers)*(i+1));
        }
    }
}

function plusOrMinus() {
    return round(random()) * 2 - 1;
}

// Returns random neutron velocity
function randVelocity() {
    return random(CONFIG.nSpeedMin, CONFIG.nSpeedMax) * plusOrMinus();
}

function removeNeutron(n) {
    var index = neutrons.indexOf(n);

    if (index > -1) {
        neutrons.splice(index, 1);
    }
}

function updateMonitor() {
    ncount = document.getElementById("ncount");
    ncount.innerHTML = "Neutron count: " + neutrons.length;
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
        case 67:
            selected = "c";
            break;
        case 68:
            // Toggle cardinal direction neutrons
            initNeutrons();
            CONFIG.nCardDir = !CONFIG.nCardDir;
            break;
        case 70:
            selected = "f";
            break;
        case 71:
            selected = "g";
            break;
        case 72:
            // Toggle heat overlay
            heatOverlay = !heatOverlay;
            break;
        case 77:
            selected = "m";
            break;
        case 78:
            selected = "n";
            break;
        case 81:
            controlRods = !controlRods;
            break;
        case 82:
            selected = "r";
            break;
        case 87:
            selected = "w";
            break;
        case 86:
            // toggle variable editor
            break;
        case 88:
            initGrid();
            initNeutrons();

            heatOverlay = false;
            fillModerator();
            break;
        case 90:
            // Clear all neutrons
            initNeutrons();
            break;
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
        case "c":
            grid[c.x][c.y] = new Coolant(c.x, c.y);
            break;
        case "f":
            grid[c.x][c.y] = new Fuel(c.x, c.y);
            break;
        case "g":
            grid[c.x][c.y] = new ControlRod(c.x, c.y);
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
        case "w":
            grid[c.x][c.y] = new Wall(c.x, c.y);
            break;
    }
}

// Fit grid to screen
function windowResized() {
    var w = document.getElementById("sketch-container").offsetWidth;
    resizeCanvas(w, RENDER.canvasHeight);

    initGrid();
    initNeutrons();

    randomReactor();
}
