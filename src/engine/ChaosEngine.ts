export default class ChaosEngine {
    private chaos = 0;

    // CONFIG (easy to tune)
    public MAX_CHAOS = 0.5; // Bumped default cap
    private readonly CHAOS_GROWTH = 0.000015; // Increased natural growth

    setChaos(value: number) {
        this.chaos = value;
    }

    getChaos(): number {
        return this.chaos;
    }

    update(dt: number) {
        // dt is in ms
        this.chaos += dt * this.CHAOS_GROWTH;
        this.chaos = Math.min(this.chaos, this.MAX_CHAOS);
    }

    processInput(dir: number): number | null {
        const r = Math.random();

        const ignoreChance = 0.04 + this.chaos;
        const reverseChance = 0.04 + this.chaos * 0.8;

        // Ignore input
        if (r < ignoreChance) {
            return null;
        }

        // Reverse input
        if (r < ignoreChance + reverseChance) {
            return -dir;
        }

        // Normal behavior
        return dir;
    }

    shouldAutoPlay(): boolean {
        // Rare, but more likely with chaos
        // ~0.1% to 1.1% chance per frame depending on chaos level
        const chance = 0.001 + (this.chaos * 0.01);
        return Math.random() < chance;
    }

    shouldFakeCrash(): boolean {
        // Very rare event
        // ~0.05% chance max
        const chance = 0.0001 + (this.chaos * 0.005);
        return Math.random() < chance;
    }

    shouldCameraShake(): boolean {
        // Occasional shake to disorient
        const chance = 0.002 + (this.chaos * 0.02);
        return Math.random() < chance;
    }

    getCameraRotation(): number {
        // Subtle tilt based on chaos
        // -0.05 to 0.05 radians normally, up to 0.1 with max chaos
        const maxTilt = 0.02 + (this.chaos * 0.08);
        return (Math.random() - 0.5) * 2 * maxTilt;
    }
}
