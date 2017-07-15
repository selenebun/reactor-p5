class Absorber extends Tile {
    constructor(col, row) {
        super(col, row);
        this.color = {
            r: 108,
            g: 122,
            b: 137
        };
    }

    // Delete the neutron a certain percentage of the time
    onReact(n) {
        if (random(100) < ABSORB_CHANCE) {
            removeNeutron(n);
            return true;
        }
    }
}
