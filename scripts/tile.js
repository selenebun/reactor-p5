class Tile {
    constructor(col, row) {
        this.pos = new p5.Vector(col, row);
        this.temp = 0;
        this.color = {
            r: 0,
            g: 0,
            b: 0
        };
    }

    // Display tile on the screen
    display() {
        fill(this.color.r, this.color.g, this.color.b);
        stroke(0);
        rect(this.pos.x*CELLSIZE, this.pos.y*CELLSIZE, CELLSIZE-1, CELLSIZE-1);
    }

    // Find center of tile
    center() {
        var x = this.pos.x*CELLSIZE + CELLSIZE/2;
        var y = this.pos.y*CELLSIZE + CELLSIZE/2;
        return {x: x, y: y};
    }

    // Behavior for collision with neutron
    // Override
    onReact(n) {}

    // Behavior for each cycle of the simulation
    // Override
    update() {}
}
