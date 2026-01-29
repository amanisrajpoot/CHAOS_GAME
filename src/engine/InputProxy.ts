import ChaosEngine from "./ChaosEngine";

export default class InputProxy {
    private chaos: ChaosEngine;
    private locked = false;

    constructor(chaos: ChaosEngine) {
        this.chaos = chaos;
    }

    // Temporarily disable player control (used by autoplay / fake crash)
    lock(ms: number) {
        this.locked = true;
        setTimeout(() => {
            this.locked = false;
        }, ms);
    }

    handle(dir: number): number | null {
        if (this.locked) {
            return null;
        }

        return this.chaos.processInput(dir);
    }
}
