import Phaser from "phaser";
import ChaosEngine from "../engine/ChaosEngine";
import InputProxy from "../engine/InputProxy";
import SoundSynth from "../engine/SoundSynth";
import CharacterGenerator from "../engine/CharacterGenerator";
import ObstacleGenerator, { ObstacleType } from "../engine/ObstacleGenerator";
import ChaosEventManager, { ChaosEventType } from "../engine/ChaosEventManager";

// Visual Configuration
// User requested "Backup" of sizes.
export const V1_SMALL = {
    laneWidth: 120,    // Standard
    fontSize: "60px",
    playerYOffset: 40,
    wobbleScale: 0.1
};

const V2_CHONKY = {
    laneWidth: 150,    // Wider lanes for bigger bois
    fontSize: "100px", // MASSIVE
    playerYOffset: 70, // Needs more shift up
    wobbleScale: 0.15
};

const CONFIG = V2_CHONKY; // <--- ACTIVE CONFIG
const LANES = [-CONFIG.laneWidth, 0, CONFIG.laneWidth];

export default class PlayScene extends Phaser.Scene {
    lane = 1;
    // Speed in units per ms (0.01 = 10 units/sec)
    // z range: 20 (far) -> 1 (near/player)
    speed = 0.01;
    obstacles: any[] = [];

    chaos!: ChaosEngine;
    inputProxy!: InputProxy;

    isDead = false;
    currentAvatar = "🤡";

    // Sound Engine
    soundSynth!: SoundSynth;

    // Render groups (IMPORTANT)
    backgroundGroup!: Phaser.GameObjects.Group;
    worldGroup!: Phaser.GameObjects.Group;
    uiGroup!: Phaser.GameObjects.Group;
    overlayGroup!: Phaser.GameObjects.Group;

    private streamerMode = false;
    private initialChaos = 0;

    constructor() {
        super("Play");
    }

    init(data: { streamerMode?: boolean; chaosLevel?: number }) {
        this.streamerMode = !!data?.streamerMode;
        this.initialChaos = data?.chaosLevel || 0;
    }

    create() {
        this.isDead = false;
        this.obstacles = [];

        // Initialize Groups FIRST (Fixes crash)
        this.backgroundGroup = this.add.group();
        this.worldGroup = this.add.group();
        this.uiGroup = this.add.group();
        this.overlayGroup = this.add.group();

        this.chaos = new ChaosEngine();
        this.inputProxy = new InputProxy(this.chaos);
        this.soundSynth = new SoundSynth();

        // Apply starting chaos
        if (this.initialChaos > 0) {
            this.chaos.setChaos(this.initialChaos);
        }

        if (this.streamerMode) {
            this.chaos.setChaos(Math.max(0.5, this.initialChaos)); // Ensure at least 0.5
            this.chaos.MAX_CHAOS = 1.0;
            this.showText("STREAMER MODE ACTIVE 💀");
        }

        this.currentAvatar = CharacterGenerator.getRandomAvatar();

        this.createBackground();
        this.createScanlines();

        if (this.input.keyboard) {
            this.input.keyboard.removeAllListeners();

            this.input.keyboard.on("keydown-LEFT", () => this.move(-1));
            this.input.keyboard.on("keydown-A", () => this.move(-1));
            this.input.keyboard.on("keydown-RIGHT", () => this.move(1));
            this.input.keyboard.on("keydown-D", () => this.move(1));
        }

        // TOUCH CONTROLS
        this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            if (pointer.x < 400) {
                this.move(-1);
            } else {
                this.move(1);
            }
        });

        this.spawnObstacle();
        this.showText("TAP SIDES TO MOVE");
    }

    move(dir: number) {
        if (this.isDead) return;

        const result = this.inputProxy.handle(dir);

        if (result === null) {
            this.showText("Input ignored 🙂");
            this.playSound("glitch");
            return;
        }

        this.lane = Phaser.Math.Clamp(this.lane + result, 0, 2);
    }

    spawnObstacle() {
        const config = ObstacleGenerator.getNext();
        this.obstacles.push({
            lane: Phaser.Math.Between(0, 2),
            z: 20, // Spawn far away
            emoji: config.emoji,
            type: config.type
        });
    }

    update(_: number, dt: number) {
        if (this.isDead) return;

        this.chaos.update(dt);

        // CHAOS EVENTS (respect death)
        if (this.chaos.shouldAutoPlay()) {
            this.autoPlay();
        }

        if (this.chaos.shouldFakeCrash()) {
            this.fakeCrash();
        }

        // ACTIVE HARASSMENT (Chaos Events)
        const currentChaos = this.chaos.getChaos();
        const event = ChaosEventManager.getEvent(currentChaos);

        if (event !== ChaosEventType.NONE) {
            this.handleChaosEvent(event);
        }

        // CAMERA CHAOS
        if (this.chaos.shouldCameraShake()) {
            this.cameras.main.shake(200, 0.005);
        }

        // Drunk camera effect (subtle tilt)
        // We act directly on rotation for a disorienting feel
        const cam = this.cameras.main as any;
        cam.setRotation(
            Phaser.Math.Linear(
                cam.rotation,
                this.chaos.getCameraRotation(),
                0.05
            )
        );

        // MOVE OBSTACLES
        this.obstacles.forEach(o => (o.z -= this.speed * dt));

        // LOGIC FIX: Don't spawn inside filter
        let shouldSpawn = false;

        this.obstacles = this.obstacles.filter(o => {
            // Player is at z=1 approx
            if (o.z < 1) {
                if (o.lane === this.lane) {
                    if (o.type === ObstacleType.DEADLY) {
                        this.die("Died to " + o.emoji);
                        return false;
                    } else {
                        // FAKE OBSTACLE
                        this.playSound("glitch");
                        this.showText("FAKE OUT 👻");
                    }
                }
                // Mark for spawn
                shouldSpawn = true;
                return false;
            }
            return true;
        });

        if (shouldSpawn) {
            this.spawnObstacle();
        }

        // NEON TRAIL EFFECT
        // Create a fading text object at player position every few frames
        if (this.time.now % 100 < 20) { // Throttle
            const playerScale = 1;
            const playerY = (300 + 300 * playerScale) - CONFIG.playerYOffset;
            const x = 400 + LANES[this.lane] * playerScale;

            const ghost = this.add.text(x, playerY, this.currentAvatar, {
                fontSize: CONFIG.fontSize,
                color: "#00ffff" // Neon Cyan Tint attempt (text color)
            }).setOrigin(0.5).setAlpha(0.3);

            this.worldGroup.add(ghost);

            this.tweens.add({
                targets: ghost,
                alpha: 0,
                scale: 1.5,
                duration: 500,
                onComplete: () => ghost.destroy()
            });
        }

        this.renderWorld();
    }

    // 🔥 ONLY DEATH FUNCTION
    die(reason: string) {
        if (this.isDead) return;

        this.playSound("error");
        this.isDead = true;
        this.input.keyboard?.removeAllListeners();

        // 💥 PARTICLE EXPLOSION
        this.add.particles(0, 0, this.currentAvatar, {
            speed: { min: -300, max: 300 },
            angle: { min: 0, max: 360 },
            scale: { start: 1, end: 0 },
            lifespan: 1000,
            gravityY: 500,
            quantity: 50,
            x: 400 + LANES[this.lane],
            y: (300 + 300) - CONFIG.playerYOffset // recalc Y approx
        });

        // Hide player while particles explode
        this.time.delayedCall(50, () => {
            // We can't easily hide the specific text object without ref, but it's okay, 
            // transition to Death scene happens anyway.
        });

        this.time.delayedCall(800, () => {
            this.scene.start("Death", { reason });
        });
    }

    autoPlay() {
        if (this.isDead) return;

        this.showText("Helping you 😇");
        this.playSound("success");
        this.lane = Phaser.Math.Between(0, 2);
    }

    fakeCrash() {
        if (this.isDead) return;

        this.showText("ERROR: PLAYER SKILL NOT FOUND");
        this.playSound("error");
    }

    playSound(key: string) {
        if (this.isDead) return;

        // Procedural fallback
        switch (key) {
            case "glitch":
                this.soundSynth.playGlitch();
                break;
            case "error":
                this.soundSynth.playError();
                break;
            case "success":
                this.soundSynth.playSuccess();
                break;
        }

        // Real assets (if loaded)
        if (this.sound.get(key)) {
            this.sound.play(key);
        }
    }

    handleChaosEvent(event: ChaosEventType) {
        switch (event) {
            case ChaosEventType.INVERT_COLORS:
                this.game.canvas.style.filter = "invert(1)";
                this.time.delayedCall(200, () => {
                    this.game.canvas.style.filter = "none";
                });
                this.playSound("glitch");
                break;

            case ChaosEventType.SCREEN_TILT:
                this.cameras.main.shake(500, 0.02);
                this.cameras.main.rotateTo(Phaser.Math.Between(-0.2, 0.2), true, 500);
                this.time.delayedCall(500, () => this.cameras.main.rotateTo(0, true, 500));
                break;

            case ChaosEventType.FAKE_CHAT:
                const msg = ChaosEventManager.getRandomChatMessage();
                const text = this.add.text(
                    800,
                    Phaser.Math.Between(100, 500),
                    msg,
                    { fontSize: "24px", color: "#00ff00", backgroundColor: "#000000aa" }
                );
                this.uiGroup.add(text);
                this.tweens.add({
                    targets: text,
                    x: -200,
                    duration: 3000,
                    onComplete: () => text.destroy()
                });
                break;

            case ChaosEventType.FAKE_LAG:
                this.game.pause();
                const spinner = this.add.text(400, 300, "⟳ Connection Lost...", { fontSize: "30px", color: "#fff" }).setOrigin(0.5);
                this.uiGroup.add(spinner);
                setTimeout(() => {
                    this.game.resume();
                    spinner.destroy();
                }, Phaser.Math.Between(200, 800)); // Short lag spike
                break;

            case ChaosEventType.INPUT_SCRAMBLE:
                this.showText("CONTROLS REVERSED? 😈");
                this.playSound("error");
                break;

            case ChaosEventType.FAKE_DONATION:
                // Fake TTS Donation
                const donor = "User" + Phaser.Math.Between(100, 999);
                const donationText = this.add.text(400, 100, `💰 ${donor} donated $5.00!\n"LUL U SUCK"`, {
                    fontSize: "24px",
                    color: "#00ff00",
                    backgroundColor: "#000000dd",
                    padding: { x: 10, y: 10 },
                    align: "center"
                }).setOrigin(0.5);

                this.uiGroup.add(donationText);
                this.playSound("success"); // Bing!

                this.tweens.add({
                    targets: donationText,
                    y: 150,
                    alpha: 0,
                    duration: 4000,
                    delay: 2000,
                    onComplete: () => donationText.destroy()
                });
                break;
        }
    }

    showText(text: string) {
        const t = this.add
            .text(400, 150, text, {
                fontSize: "20px",
                color: "#ff5555"
            })
            .setOrigin(0.5);

        this.uiGroup.add(t);

        this.time.delayedCall(900, () => t.destroy());
    }

    createScanlines() {
        // CRT Scanline effect
        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.1); // Dark semitransparent lines

        for (let y = 0; y < 600; y += 4) {
            graphics.fillRect(0, y, 800, 2);
        }

        // Vignette (Dark corners)
        // Simple radial gradient approximation not easily doable with basic graphics without texture
        // We'll skip complex vignette for now to keep it cheap.

        this.overlayGroup.add(graphics);
    }

    createBackground() {
        // 1. STARFIELD
        // Create 50 stars
        for (let i = 0; i < 50; i++) {
            const star = this.add.rectangle(
                Phaser.Math.Between(0, 800),
                Phaser.Math.Between(0, 300), // Top half only
                2, 2,
                0xffffff
            );
            this.backgroundGroup.add(star);

            // Twinkle tween
            this.tweens.add({
                targets: star,
                alpha: 0.2,
                duration: Phaser.Math.Between(500, 1500),
                yoyo: true,
                repeat: -1
            });
        }

        // 2. CYBERPUNK SUN
        // Big glowing circle near horizon
        const sun = this.add.circle(400, 300, 60, 0xff00cc);
        sun.setAlpha(0.8);
        this.backgroundGroup.add(sun);

        // Sun Glow
        const sunGlow = this.add.circle(400, 300, 80, 0xff00cc);
        sunGlow.setAlpha(0.3);
        this.backgroundGroup.add(sunGlow);

        this.tweens.add({
            targets: [sun, sunGlow],
            scaleX: 1.1,
            scaleY: 1.1,
            yoyo: true,
            duration: 2000,
            ease: "Sine.easeInOut",
            repeat: -1
        });
    }

    renderWorld() {
        // Clear only world objects
        this.worldGroup.clear(true, true);

        // Constants for Fake 3D
        const EVENT_HORIZON_Y = 300;
        const CAMERA_HEIGHT = 300;

        // Draw Floor Grid (Fake 3D)

        // Vertical Lines (Perception of lanes)
        const lineLanes = [-180, -60, 60, 180]; // Lane dividers/borders

        lineLanes.forEach(laneX => {
            // Draw from z=20 to z=1
            const zFar = 20;
            const zNear = 1;

            const scaleFar = 1 / zFar;
            const xFar = 400 + laneX * scaleFar;
            const yFar = EVENT_HORIZON_Y + CAMERA_HEIGHT * scaleFar;

            const scaleNear = 1 / zNear;
            const xNear = 400 + laneX * scaleNear;
            const yNear = EVENT_HORIZON_Y + CAMERA_HEIGHT * scaleNear;

            const line = this.add.line(0, 0, xFar, yFar, xNear, yNear, 0x333333);
            line.setOrigin(0, 0);
            this.worldGroup.add(line);
        });

        // Horizontal Moving Lines (Speed sensation)
        const gridTime = this.time.now * this.speed;
        const gridSpacing = 2; // z units
        const maxZ = 20;

        // Simpler loop for horizontal lines:
        const offset = gridTime % gridSpacing;
        for (let i = 0; i < maxZ / gridSpacing; i++) {
            // let z = (i * gridSpacing) - offset; // Unused


            // Adjust z so it wraps correctly to always show lines from maxZ down to 1
            // We want lines coming from maxZ towards 1.
            // As offset increases, z decreases.
            // If z < 1, we want to wrap it to maxZ? No, it disappears. 
            // New lines appear at z=maxZ?
            // Let's just generate a set of lines based on offset.
            // Lines at: maxZ - offset, maxZ - spacing - offset, ...

            // Better: z = (i * spacing) + (spacing - offset).
            // range 1 to 20.
            const zBase = (i * gridSpacing) + (gridSpacing - offset);
            // If zBase > maxZ, effectively clipping.

            if (zBase < 1 || zBase > maxZ) continue;

            const scale = 1 / zBase;
            const y = EVENT_HORIZON_Y + CAMERA_HEIGHT * scale;

            const xLeft = 400 + (-180) * scale;
            const xRight = 400 + (180) * scale;

            const line = this.add.line(0, 0, xLeft, y, xRight, y, 0x333333);
            line.setOrigin(0, 0);
            this.worldGroup.add(line);
        }

        // OBSTACLES
        this.obstacles.forEach(o => {
            const scale = 1 / o.z;
            const x = 400 + LANES[o.lane] * scale;
            const y = EVENT_HORIZON_Y + CAMERA_HEIGHT * scale;

            if (scale > 2) return;

            const obstacle = this.add.text(
                x,
                y,
                o.emoji,
                { fontSize: CONFIG.fontSize }
            ).setOrigin(0.5, 0.5);

            obstacle.setScale(scale);
            // Slight opacity for fake?
            if (o.type === "FAKE") {
                obstacle.setAlpha(0.7);
            }

            this.worldGroup.add(obstacle);
        });

        // PLAYER
        const playerScale = 1;
        const playerY = (EVENT_HORIZON_Y + CAMERA_HEIGHT * playerScale) - CONFIG.playerYOffset;

        // Wobble Animation (Breathing/Floating)
        const wobble = Math.sin(this.time.now * 0.01) * CONFIG.wobbleScale;

        const player = this.add.text(
            400 + LANES[this.lane] * playerScale,
            playerY,
            this.currentAvatar,
            {
                fontSize: CONFIG.fontSize
            }
        ).setOrigin(0.5, 0.5); // Center origin

        // Apply scale with wobble
        player.setScale(playerScale + wobble * 0.1);

        // Apply rotation with wobble
        player.setRotation(wobble * 0.2);

        this.worldGroup.add(player);
    }
}
