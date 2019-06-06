//////////////////////////
//  Global variables    //
//////////////////////////


// Configuration
const CONFIG = {
    absorberChance: 25,     // chance for absorber to absorb a neutron
    absorberCool: 1,        // absorber cooling per tick
    absorberHeat: 200,      // heat generated per collision
    controlRodChance: 50,   // chance for control rod to absorb a neutron
    controlRodCool: 1,      // control rod cooling per tick
    controlRodHeat: 200,    // heat generated per collision
    coolantCool: 400,       // coolant cell cooling per tick
    fuelChance: 7,          // chance for fuel rod to absorb a neutron
    fuelCool: 1,            // fuel rod cooling per tick
    fuelHeat: 400,          // heat generated per reaction
    fuelSpontChance: 5,     // chance for spontaneous neutron emission
    fuelSpontHeat: 2,       // heat generated per spontaneous neutron emission
    heatMax: 10000,         // maximum allowed heat
    heatTransfer: 5,        // percent of heat transferred to adjacent tiles
    moderatorCool: 2,       // moderator cooling per tick
    nCardDir: false,        // neutrons only travel in cardinal directions
    nSpawnMin: 1,           // min number of neutrons per reaction
    nSpawnMax: 3,           // max number of neutrons per reaction
    nSpeedMin: 1,           // min neutron speed
    nSpeedMax: 10,          // max neutron speed
    reflectorCool: 1,       // reflector cooling per tick
    reflectorHeat: 100,     // heat generated per reflection
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

var controlRods = true;
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

    fillEdges();
}

// Fill edges with walls
function fillEdges() {
    for (var x = 0; x < cols; x++) {
        grid[x][0] = new Wall(x, 0);
        grid[x][rows-1] = new Wall(x, rows-1);
    }

    for (var y = 1; y < rows-1; y++) {
        grid[0][y] = new Wall(0, y);
        grid[cols-1][y] = new Wall(cols-1, y);
    }
}

// Create example reactor
function defaultReactor() {
    fillModerator();

    grid[1][1] = new Wall(1, 1);
    grid[1][12] = new Wall(1, 12);
    grid[12][1] = new Wall(12, 1);
    grid[12][12] = new Wall(12, 12);

    for (var x = 2; x < 12; x++) {
        grid[x][1] = new VerticalReflector(x, 1);
        grid[x][12] = new VerticalReflector(x, 12);
    }

    for (var y = 2; y < 12; y++) {
        grid[1][y] = new HorizontalReflector(1, y);
        grid[12][y] = new HorizontalReflector(12, y);
    }

    for (var x = 3; x < 11; x++) {
        for (var y = 3; y < 11; y++) {
            grid[x][y] = new Fuel(x, y);
        }
    }

    for (var x = 2; x < 12; x++) {
        grid[x][2] = new ControlRod(x, 2);
        grid[x][5] = new ControlRod(x, 5);
        grid[x][8] = new ControlRod(x, 8);
        grid[x][11] = new ControlRod(x, 11);
    }

    for (var y = 3; y < 11; y++) {
        grid[2][y] = new ControlRod(2, y);
        grid[5][y] = new ControlRod(5, y);
        grid[8][y] = new ControlRod(8, y);
        grid[11][y] = new ControlRod(11, y);
    }
}


//////////////////////////////
//  Misc. custom functions  //
//////////////////////////////


// Ensure that the min value is less than or equal to the max value
function checkMinMax(min, max) {
    if (min > max) {
        return max;
    } else {
        return min;
    }
}

// Ensure value falls within the correct bounds
function constrain(value, min=0, max=1000000) {
    value = int(value);
    if (value < min) {
        return min;
    } else if (value > max) {
        return max;
    } else {
        return value;
    }
}

// Find the nearest tile
function currentTile(x, y) {
    return {
        x: floor(x / RENDER.cellSize),
        y: floor(y / RENDER.cellSize)
    };
}

// User drawing
function drawMap() {
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
        case "w":
            grid[c.x][c.y] = new Wall(c.x, c.y);
            break;
        case ",":
            grid[c.x][c.y] = new VerticalReflector(c.x, c.y);
            break;
        case ".":
            grid[c.x][c.y] = new HorizontalReflector(c.x, c.y);
            break;
    }
    
    fillEdges();
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

// Returns 1 or -1
function plusOrMinus() {
    return round(random()) * 2 - 1;
}

// Returns random neutron velocity
function randVelocity() {
    return random(CONFIG.nSpeedMin, CONFIG.nSpeedMax) * plusOrMinus();
}

// Deletes a neutron
function removeNeutron(n) {
    var index = neutrons.indexOf(n);

    if (index > -1) {
        neutrons.splice(index, 1);
    }
}

// Updates the monitor with information
function updateMonitor() {
    ncount = document.getElementById("ncount");
    ncount.innerHTML = "Neutron count: " + neutrons.length;
}

// Updates configuration from user input
function vars() {
    var form = document.getElementById("vars");

    CONFIG.absorberChance = constrain(form.absorberChance.value, 0, 100);
    CONFIG.absorberCool = constrain(form.absorberCool.value, 0, 1000000);
    CONFIG.absorberHeat = constrain(form.absorberHeat.value, 0, 1000000);
    CONFIG.controlRodChance = constrain(form.controlRodChance.value, 0, 100);
    CONFIG.controlRodCool = constrain(form.controlRodCool.value, 0, 1000000);

    CONFIG.controlRodHeat = int(form.controlRodHeat.value)
    CONFIG.coolantCool = int(form.coolantCool.value)
    CONFIG.fuelChance = int(form.fuelChance.value)
    CONFIG.fuelCool = int(form.fuelCool.value)
    CONFIG.fuelHeat = int(form.fuelHeat.value)
    CONFIG.fuelSpontChance = int(form.fuelSpontChance.value)
    CONFIG.fuelSpontHeat = int(form.fuelSpontHeat.value)
    CONFIG.heatMax = int(form.heatMax.value)
    CONFIG.heatTransfer = int(form.heatTransfer.value)
    CONFIG.moderatorCool = int(form.moderatorCool.value)
    CONFIG.nSpawnMin = int(form.nSpawnMin.value)
    CONFIG.nSpawnMax = int(form.nSpawnMax.value)
    CONFIG.nSpeedMin = int(form.nSpeedMin.value)
    CONFIG.nSpeedMax = int(form.nSpeedMax.value)
    CONFIG.reflectorCool = int(form.reflectorCool.value)
    CONFIG.reflectorHeat = int(form.reflectorHeat.value)

    // CONFIG.wallCool = form.wallCool.value

    CONFIG.renderGlow = form.renderGlow.checked
    CONFIG.nCardDir = form.nCardDir.checked
}

function initVars() {
    var form = document.getElementById("vars");

    form.absorberChance.value = CONFIG.absorberChance
    form.absorberCool.value = CONFIG.absorberCool
    form.absorberHeat.value = CONFIG.absorberHeat
    form.controlRodChance.value = CONFIG.controlRodChance
    form.controlRodCool.value = CONFIG.controlRodCool

    form.controlRodHeat.value = CONFIG.controlRodHeat
    form.coolantCool.value = CONFIG.coolantCool
    form.fuelChance.value = CONFIG.fuelChance
    form.fuelCool.value = CONFIG.fuelCool
    form.fuelHeat.value = CONFIG.fuelHeat
    form.fuelSpontChance.value = CONFIG.fuelSpontChance
    form.fuelSpontHeat.value = CONFIG.fuelSpontHeat
    form.heatMax.value = CONFIG.heatMax
    form.heatTransfer.value = CONFIG.heatTransfer
    form.moderatorCool.value = CONFIG.moderatorCool
    form.nSpawnMin.value = CONFIG.nSpawnMin
    form.nSpawnMax.value = CONFIG.nSpawnMax
    form.nSpeedMin.value = CONFIG.nSpeedMin
    form.nSpeedMax.value = CONFIG.nSpeedMax
    form.reflectorCool.value = CONFIG.reflectorCool
    form.reflectorHeat.value = CONFIG.reflectorHeat
    // form.wallCool.value = CONFIG.wallCool

    form.renderGlow.checked = CONFIG.renderGlow
    form.nCardDir.checked = CONFIG.nCardDir
}

/*
// Configuration
const CONFIG = {
    absorberChance: 25,     // chance for absorber to absorb a neutron
    absorberCool: 2,        // absorber cooling per tick
    absorberHeat: 2,        // heat generated per collision
    controlRodChance: 50,   // chance for control rod to absorb a neutron
    controlRodCool: 2,      // control rod cooling per tick
    controlRodHeat: 4,      // heat generated per collision
    coolantCool: 80,        // coolant cell cooling per tick
    fuelChance: 5,          // chance for fuel cell to absorb a neutron
    fuelCool: 1,            // fuel cell cooling per tick
    fuelHeat: 20,           // heat generated per reaction
    fuelSpontChance: 5,     // chance for spontaneous neutron emission
    fuelSpontHeat: 2,       // heat generated per spontaneous neutron emission
    heatMax: 1000,          // maximum allowed heat
    heatTransfer: 2,        // percent of heat transferred to adjacent tiles
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
*/


//////////////////////////////////
//  p5.js built-in functions    //
//////////////////////////////////


function setup() {
    initCanvas();
    initGrid();
    initNeutrons();
    initVars()

    defaultReactor();
}

function draw() {
    background(210, 215, 211);

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
        case 87:
            selected = "w";
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
        case 188:
            selected = ",";
            break;
        case 190:
            selected = ".";
            break;
    }
}

function mouseDragged() {
    drawMap();
}

function mousePressed() {
    drawMap();
}

// Fit grid to screen
function windowResized() {
    var w = document.getElementById("sketch-container").offsetWidth;
    resizeCanvas(w, RENDER.canvasHeight);

    initGrid();
    initNeutrons();

    defaultReactor();
}
