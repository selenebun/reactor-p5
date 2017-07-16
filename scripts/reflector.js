class Reflector extends Tile {
    constructor(col, row) {
        super(col, row);
        this.cool = CONFIG.reflectorCool;
        this.color = {
            r: 34,
            g: 49,
            b: 63
        };
    }

    // Reflect the neutron
    onReact(n) {
        if (n.vel.x) {
            n.vel.x *= -1;
        } else {
            n.vel.y *= -1;
        }
        
        this.heat += CONFIG.reflectorHeat;
    }

    update() {
        this.spreadHeat();
    }
}
