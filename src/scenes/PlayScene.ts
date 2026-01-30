import Phaser from "phaser";
import ChaosEngine from "../engine/ChaosEngine";
import InputProxy from "../engine/InputProxy";
import SoundSynth from "../engine/SoundSynth";
import CharacterGenerator from "../engine/CharacterGenerator";
import ObstacleGenerator, { ObstacleType } from "../engine/ObstacleGenerator";
import ChaosEventManager, { ChaosEventType } from "../engine/ChaosEventManager";
import { PALETTES, CONSTANTS } from "../engine/Visuals";

export default class PlayScene extends Phaser.Scene {
    lane = 1;
    speed = 0.02;
    position = 0;
    score = 0;
    highScore = 0;
    beatGame = false;

    scoreText!: Phaser.GameObjects.Text;
    highScoreText!: Phaser.GameObjects.Text;

    obstacles: any[] = [];
    chaos!: ChaosEngine;
    inputProxy!: InputProxy;
    soundSynth!: SoundSynth;

    isDead = false;
    currentAvatar = "🤡";

    // Rendering
    graphics!: Phaser.GameObjects.Graphics;
    uiGroup!: Phaser.GameObjects.Group;

    // Background Elements
    sun!: Phaser.GameObjects.Shape;
    sunGlow!: Phaser.GameObjects.Shape;
    starField!: Phaser.GameObjects.Group;

    // Responsive Properties
    private lanes: number[] = [0, 0, 0];
    private laneWidth = 150;
    private cameraHeight = 1000;
    private horizonY = 300;
    private centerX = 400;

    private streamerMode = false;
    private initialChaos = 0;

    constructor() {
        super("Play");
    }

    init(data: { streamerMode?: boolean; chaosLevel?: number }) {
        this.streamerMode = !!data?.streamerMode;
        this.initialChaos = data?.chaosLevel || 0;

        try {
            const saved = localStorage.getItem('chaos_highscore');
            const storedVal = saved ? parseInt(saved, 10) : 0;
            this.highScore = Math.max(storedVal, 69420);
        } catch (e) {
            console.warn("Failed to load high score", e);
        }
    }

    create() {
        this.updateDimensions();
        this.scale.on('resize', this.resize, this);

        this.isDead = false;
        this.obstacles = [];
        this.position = 0;
        this.score = 0;
        this.speed = 0.02;

        // Visual setup
        this.createBackground();
        this.starField = this.add.group();
        this.createStars();

        // Main Drawing Graphics
        this.graphics = this.add.graphics();
        this.uiGroup = this.add.group();

        // Engine Setup
        this.chaos = new ChaosEngine();
        this.inputProxy = new InputProxy(this.chaos);
        this.soundSynth = new SoundSynth();

        if (this.initialChaos > 0) {
            this.chaos.setChaos(this.initialChaos);
        }
        if (this.streamerMode) {
            this.chaos.setChaos(Math.max(0.5, this.initialChaos));
            this.chaos.MAX_CHAOS = 1.0;
            this.showText("STREAMER MODE ACTIVE 💀");
        }

        this.currentAvatar = CharacterGenerator.getRandomAvatar();

        this.setupInput();

        this.spawnObstacle();
        this.showText("RUN FOR YOUR LIFE");

        this.createUI();
    }

    resize(gameSize: Phaser.Structs.Size) {
        this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
        this.updateDimensions();
        this.createUI(); // Re-create UI to position correctly
        this.createBackground(); // Re-create background to center
    }

    updateDimensions() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.centerX = width / 2;
        this.horizonY = height / 2;
        // Fix: Camera Height determines how far "down" the ground is projected. 
        // 0.2 * Height puts objects at Z~120 near the bottom of the screen (1.0 H).
        this.cameraHeight = height * 0.2;

        // Clamp Lane Width so it doesn't look ridiculous on ultra-wide
        // Base is 150 on 800w (approx 18%).
        // Cap at 250px absolute width.
        this.laneWidth = Math.min(width * 0.2, 250);

        // Recalculate lanes
        this.lanes = [-this.laneWidth, 0, this.laneWidth];
    }

    createUI() {
        // Destroy old UI if exists
        if (this.scoreText) this.scoreText.destroy();
        if (this.highScoreText) this.highScoreText.destroy();

        // Increased base font sizes for readability
        const scoreSize = Math.max(32, Math.min(this.scale.width * 0.06, 60)) + "px";
        const highSize = Math.max(24, Math.min(this.scale.width * 0.04, 40)) + "px";

        this.scoreText = this.add.text(20, 20, "SCORE: 0", {
            fontSize: scoreSize,
            color: "#00ffff",
            fontFamily: "monospace",
            stroke: "#000000",
            strokeThickness: 4
        }).setDepth(100);

        this.highScoreText = this.add.text(20, 20 + (parseInt(scoreSize) * 1.2), `HI: ${this.highScore}`, {
            fontSize: highSize,
            color: "#ff00ff",
            fontFamily: "monospace",
            stroke: "#000000",
            strokeThickness: 3
        }).setDepth(100);
    }

    // ... (move method unchanged)

    setupInput() {
        if (this.input.keyboard) {
            this.input.keyboard.removeAllListeners();
            this.input.keyboard.on("keydown-LEFT", () => this.move(-1));
            this.input.keyboard.on("keydown-A", () => this.move(-1));
            this.input.keyboard.on("keydown-RIGHT", () => this.move(1));
            this.input.keyboard.on("keydown-D", () => this.move(1));
        }

        this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            if (pointer.x < this.centerX) this.move(-1);
            else this.move(1);
        });
    }

    move(dir: number) {
        if (this.isDead) return;
        const result = this.inputProxy.handle(dir);
        if (result === null) {
            this.showText("BLOCKED");
            this.playSound("glitch");
            return;
        }
        this.lane = Phaser.Math.Clamp(this.lane + result, 0, 2);
    }

    spawnObstacle() {
        const config = ObstacleGenerator.getNext();
        const spawnZ = this.position + CONSTANTS.drawDistance;

        this.obstacles.push({
            lane: Phaser.Math.Between(0, 2),
            z: spawnZ,
            emoji: config.emoji,
            type: config.type,
            active: true
        });
    }

    update(_: number, dt: number) {
        try {
            // Only update game state if alive
            if (!this.isDead) {
                this.chaos.update(dt);
                this.position += this.speed * dt * 100; // Move forward
                this.score += Math.floor(this.speed * dt * 10);

                if (this.score >= 69420) {
                    this.score = 69420;
                    if (!this.beatGame) {
                        this.beatGame = true;
                        this.showText("MAX VIBES REACHED (69420)");
                        this.soundSynth.playSuccess();
                    }
                }
                if (this.scoreText) this.scoreText.setText(`SCORE: ${this.score}`);

                this.speed = Math.min(0.08, this.speed + 0.000005 * dt);

                // --- Chaos Events ---
                if (this.chaos.shouldAutoPlay()) this.autoPlay();
                if (this.chaos.shouldFakeCrash()) this.fakeCrash();
                if (this.chaos.shouldCameraShake()) this.cameras.main.shake(100, 0.005);

                const currentChaos = this.chaos.getChaos();
                const event = ChaosEventManager.getEvent(currentChaos);
                if (event !== ChaosEventType.NONE) this.handleChaosEvent(event);

                // --- Game Logic ---
                this.checkCollisions();
                this.cleanupObstacles();

                const lastObstacle = this.obstacles[this.obstacles.length - 1];
                if (!lastObstacle || (lastObstacle.z < this.position + CONSTANTS.drawDistance - 600)) {
                    if (Phaser.Math.Between(0, 100) < 5 + currentChaos * 10) {
                        this.spawnObstacle();
                    }
                }
            }

            // --- Rendering (ALWAYS RUN) ---
            // This ensures the game doesn't look "frozen" when you die
            this.graphics.clear();
            this.renderRoad();
            this.renderObjects();
        } catch (err: any) {
            console.error(err);
            if (!this.data.get('errorShown')) {
                this.data.set('errorShown', true);
                this.add.text(10, 100, "ERR: " + err.message, {
                    fontSize: "20px", color: "red", backgroundColor: "black"
                }).setDepth(999);
            }
        }
    }

    project(x: number, _y: number, z: number) {
        // Perspective Projection
        const scale = CONSTANTS.focalLength / (z || 1);
        return {
            x: this.centerX + (x * scale),
            y: this.horizonY + (this.cameraHeight * scale),
            scale: scale
        };
    }

    renderRoad() {
        // Dynamic Horizon
        const w = this.scale.width;
        const h = this.scale.height;
        const horizon = this.horizonY;

        const palette = PALETTES.NEON_NIGHTS;
        const segmentsToDraw = 40;
        const segmentLength = 200;

        // Sky
        this.graphics.fillGradientStyle(
            palette.skyTop, palette.skyTop,
            palette.skyBottom, palette.skyBottom,
            1
        );
        this.graphics.fillRect(0, 0, w, horizon);

        // Grid Floor
        this.graphics.fillStyle(palette.gridFloor || 0x220044);
        this.graphics.fillRect(0, horizon, w, h - horizon);

        // Perspective lines
        this.graphics.lineStyle(1, palette.grid || 0x00ffff, 0.3);

        // Draw grid lines based on lane width units
        // Extend far beyond visible width to cover rotations/widescreen
        const gridWidth = this.laneWidth * 1.5;

        for (let x = -gridWidth * 10; x <= gridWidth * 10; x += gridWidth) {
            const p1 = this.project(x, 0, 0); // At player
            // p2 (far point) is implicit via center convergence
            this.graphics.beginPath();
            // Projecting 0 z is at player. Infinite z is at horizon (centerX, horizonY)
            this.graphics.moveTo(p1.x, p1.y);
            this.graphics.lineTo(this.centerX, this.horizonY);
            this.graphics.strokePath();
        }

        for (let n = segmentsToDraw; n > 0; n--) {
            const zNear = n * segmentLength - (this.position % segmentLength);
            const zFar = (n + 1) * segmentLength - (this.position % segmentLength);

            if (zNear < 10) continue;

            const fog = n / segmentsToDraw;
            const alpha = Phaser.Math.Clamp(1 - (fog * fog), 0.1, 1);

            const segIndex = Math.floor(this.position / segmentLength) + n;
            const isAlt = segIndex % 2 !== 0;
            const colorRoad = isAlt ? palette.roadLight : palette.roadDark;

            // Use dynamic lane width for the Main Road
            const roadW = this.laneWidth * 2.5; // Main road width coverage

            const r1 = this.project(-roadW, 0, zNear);
            const r2 = this.project(roadW, 0, zNear);
            const r3 = this.project(roadW, 0, zFar);
            const r4 = this.project(-roadW, 0, zFar);

            this.graphics.fillStyle(colorRoad, alpha);
            this.graphics.beginPath();
            this.graphics.moveTo(r1.x, r1.y);
            this.graphics.lineTo(r2.x, r2.y);
            this.graphics.lineTo(r3.x, r3.y);
            this.graphics.lineTo(r4.x, r4.y);
            this.graphics.fillPath();

            // Lanes
            if (isAlt) {
                const stripeW = this.laneWidth * 0.05;
                const l1 = this.project(-stripeW, 0, zNear);
                const l2 = this.project(stripeW, 0, zNear);
                const l3 = this.project(stripeW, 0, zFar);
                const l4 = this.project(-stripeW, 0, zFar);

                this.graphics.fillStyle(palette.laneStripes);
                this.graphics.beginPath();
                this.graphics.moveTo(l1.x, l1.y);
                this.graphics.lineTo(l2.x, l2.y);
                this.graphics.lineTo(l3.x, l3.y);
                this.graphics.lineTo(l4.x, l4.y);
                this.graphics.fillPath();
            }
        }
    }

    renderObjects() {
        const renderList: any[] = [];
        const playerRenderZ = 120;
        const playerX = this.lanes[this.lane];

        // Player
        renderList.push({
            type: 'player',
            z: this.position + playerRenderZ,
            x: playerX,
            y: 0,
            sprite: this.currentAvatar,
            scaleCorrection: 0.4
        });

        // Obstacles
        this.obstacles.forEach(o => {
            if (o.z > this.position + 10) {
                renderList.push({
                    type: o.type,
                    z: o.z,
                    x: this.lanes[o.lane],
                    y: 0,
                    sprite: o.emoji,
                    obj: o
                });
            }
        });

        renderList.sort((a, b) => b.z - a.z);

        this.uiGroup.clear(true, true);

        renderList.forEach(item => {
            const relZ = item.z - this.position;
            if (relZ < 10) return;

            const p = this.project(item.x, item.y, relZ);

            let wobble = 0;
            let scale = p.scale;
            if (item.scaleCorrection) scale *= item.scaleCorrection;

            if (item.type === 'player') {
                wobble = Math.sin(this.time.now * 0.01) * 0.1;
                scale += wobble;
            } else {
                if (item.sprite === "💀" || item.sprite === "📉" || item.sprite === "✨") {
                    wobble = Math.sin(this.time.now * 0.005) * 0.2;
                }
            }

            const t = this.add.text(p.x, p.y, item.sprite, {
                fontSize: (this.laneWidth * 0.8 * scale) + "px" // Scale based on lane width
            }).setOrigin(0.5, 0.85);

            if (item.type !== 'player') {
                const seed = Math.floor(Math.abs(item.z));
                const animType = seed % 4;
                switch (animType) {
                    case 0: t.setRotation(Math.sin(this.time.now * 0.003 + item.z) * 0.3); break;
                    case 1: t.setScale(1 + Math.sin(this.time.now * 0.01 + item.z) * 0.2); break;
                    case 2: t.setX(t.x + Math.sin(this.time.now * 0.05) * 5); break;
                    case 3: t.setY(t.y + Math.cos(this.time.now * 0.005 + item.z) * 10); break;
                }
            }

            if (item.type === 'FAKE') t.setAlpha(0.6);
            if (item.type === 'player') t.setTint(0x00ffff);

            this.uiGroup.add(t);
        });
    }

    checkCollisions() {
        const playerZ = this.position + 120; // Must match playerRenderZ
        const hitBox = 30;

        this.obstacles.forEach(o => {
            if (!o.active) return;
            if (Math.abs(o.z - playerZ) < hitBox) {
                if (o.lane === this.lane) {
                    if (o.type === ObstacleType.DEADLY) {
                        const deathMsgs = ["VIBE CHECK FAILED: ", "BONKED by ", "L + RATIO + ", "CRINGED AT "];
                        const msg = Phaser.Math.RND.pick(deathMsgs);
                        this.die(msg + o.emoji);
                    } else {
                        this.playSound("glitch");
                        this.showText("GHOST!");
                        o.active = false;
                    }
                }
            }
        });
    }

    cleanupObstacles() {
        this.obstacles = this.obstacles.filter(o => o.z > this.position - 500);
    }

    createBackground() {
        if (this.sun) this.sun.destroy();
        if (this.sunGlow) this.sunGlow.destroy();

        const sunSize = this.scale.height * 0.15;
        const cy = this.horizonY * 0.8;

        this.sun = this.add.circle(this.centerX, cy, sunSize, 0xff00cc).setDepth(-10);
        this.sunGlow = this.add.circle(this.centerX, cy, sunSize * 1.5, 0xff00cc).setAlpha(0.3).setDepth(-11);

        this.tweens.add({
            targets: [this.sun, this.sunGlow],
            y: cy + 10,
            yoyo: true,
            duration: 4000,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createStars() {
        // Simple stars
        for (let i = 0; i < 50; i++) {
            const star = this.add.rectangle(
                Phaser.Math.Between(0, this.scale.width),
                Phaser.Math.Between(0, this.horizonY),
                2, 2, 0xffffff
            );
            this.tweens.add({
                targets: star,
                alpha: 0,
                duration: Phaser.Math.Between(500, 2000),
                yoyo: true,
                repeat: -1
            });
            this.starField.add(star);
        }
    }

    die(reason: string) {
        if (this.isDead) return;
        this.isDead = true;
        console.log("Player died: " + reason);

        try {
            this.playSound("bonk");

            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('chaos_highscore', this.highScore.toString());
            }

            this.input.keyboard?.removeAllListeners();
            this.scale.removeListener('resize', this.resize, this);

            // Calculate projected screen position for explosion
            const playerRenderZ = 120;
            const laneX = (this.lanes && this.lanes[this.lane] !== undefined) ? this.lanes[this.lane] : 0;
            const p = this.project(laneX, 0, playerRenderZ);

            // Spawn "Corpse" for animation
            const corpse = this.add.text(p.x, p.y, this.currentAvatar, {
                fontSize: Math.max(20, this.laneWidth * 0.6) + "px"
            }).setOrigin(0.5, 0.85).setDepth(200);

            // Random Death Animation
            const deathType = Phaser.Math.RND.pick(["ASCEND", "SQUASH", "SPIN", "GLITCH"]);
            switch (deathType) {
                case "ASCEND":
                    this.tweens.add({ targets: corpse, y: -100, alpha: 0, duration: 1000, angle: 20 });
                    this.showText("I MUST GO");
                    break;
                case "SQUASH":
                    this.tweens.add({ targets: corpse, scaleY: 0.1, scaleX: 1.5, y: p.y + 40, duration: 200, ease: "Bounce.easeOut" });
                    break;
                case "SPIN":
                    this.tweens.add({ targets: corpse, angle: 720, scale: 0, duration: 800, ease: "Cubic.in" });
                    break;
                case "GLITCH":
                    this.tweens.add({ targets: corpse, alpha: { from: 1, to: 0 }, x: { from: p.x - 10, to: p.x + 10 }, yoyo: true, duration: 50, repeat: 10 });
                    break;
            }
        } catch (e) {
            console.warn("Error in death animation:", e);
        }

        // Force transition using window.setTimeout to bypass any Phaser clock issues
        setTimeout(() => {
            if (this.scene) {
                try {
                    this.scene.start("Death", { reason, score: this.score, highScore: this.highScore });
                } catch (transitionError) {
                    console.error("Transition failed:", transitionError);
                    window.location.reload(); // Nuclear option if scene switch fails
                }
            }
        }, 800);
    }

    autoPlay() {
        if (this.isDead) return;
        this.showText("Helping you 😇");
        this.playSound("success");
        this.lane = Phaser.Math.Between(0, 2);
    }

    fakeCrash() {
        if (this.isDead) return;
        this.showText("ERROR: 404");
        this.playSound("error");
    }

    playSound(key: string) {
        // Allow sound to play even if dead (for death sound)
        switch (key) {
            case "glitch": this.soundSynth.playGlitch(); break;
            case "bonk": this.soundSynth.playBonk(); break;
            case "error": this.soundSynth.playError(); break;
            case "success": this.soundSynth.playSuccess(); break;
        }
    }

    showText(text: string) {
        const t = this.add.text(this.centerX, this.horizonY * 0.4, text, {
            fontSize: Math.max(30, Math.min(this.scale.width * 0.12, 80)) + "px", // Min 30px, Max 80px
            color: "#ff00ff",
            fontStyle: "bold",
            stroke: "#ffffff",
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);
        this.uiGroup.add(t);
        this.tweens.add({
            targets: t, scale: 1.5, alpha: 0, duration: 1000, onComplete: () => t.destroy()
        });
    }

    handleChaosEvent(event: ChaosEventType) {
        if (event === ChaosEventType.INVERT_COLORS) {
            this.game.canvas.style.filter = "invert(1)";
            setTimeout(() => this.game.canvas.style.filter = "none", 500);
            this.playSound("glitch");
        } else if (event === ChaosEventType.SCREEN_TILT) {
            this.cameras.main.shake(500, 0.02);
            this.cameras.main.rotateTo(Phaser.Math.Between(-0.2, 0.2), true, 500);
            this.time.delayedCall(500, () => this.cameras.main.rotateTo(0, true, 500));
        } else if (event === ChaosEventType.FAKE_CHAT) {
            this.showText(ChaosEventManager.getRandomChatMessage());
        }
    }
}
