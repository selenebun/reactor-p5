class Fuel extends Tile {
    constructor(col, row, enrichment) {
        super(col, row);
        this.enrichment = enrichment;
        this.color = {
            r: 0,
            g: 155,
            b: 0
        };
    }

    // Absorb one neutron and generate a random number of neutrons
    onReact(n) {
        if (random(100) < FUEL_ABSORB_CHANCE) {
            removeNeutron(n);

            for (var i = 0; i < random(NSPAWN_MIN, NSPAWN_MAX); i++) {
                var c = this.center();
                neutrons.push(new Neutron(c.x, c.y));
            }

            return true;
        }
    }

    // Spontaneously generate a neutron rarely
    update() {
        if (random(100) < N_SPONT_CHANCE) {
            var c = this.center();
            neutrons.push(new Neutron(c.x, c.y))
        }
    }
}
