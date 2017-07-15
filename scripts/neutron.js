class Neutron {
    constructor(x, y) {
        this.pos = new p5.Vector(x, y);

        var vx = random(NSPEED_MIN, NSPEED_MAX) * plusOrMinus();
        var vy = random(NSPEED_MIN, NSPEED_MAX) * plusOrMinus();
        this.vel = new p5.Vector(vx, vy);
        this.diameter = NSIZE;
        this.color = {
            r: 31,
            g: 58,
            b: 147
        }
    }

    // Display neutron on the screen
    display() {
        fill(this.color.r, this.color.g, this.color.b);
        stroke(0);
        ellipse(this.pos.x, this.pos.y, this.diameter, this.diameter);
    }

    // Ensure neutrons that go off the screen are deleted
    checkEdges() {
        return ((this.pos.x < 0) || (this.pos.y < 0) ||
                (this.pos.x > (cols * CELLSIZE)) ||
                (this.pos.y > (rows * CELLSIZE)));
    }

    // Update position of neutron
    update() {
        this.pos.add(this.vel);
    }
}
