import Phaser from "phaser";
import MetaSystem from "../engine/MetaSystem";

export default class DeathScene extends Phaser.Scene {
    constructor() {
        super("Death");
    }

    private titleText!: Phaser.GameObjects.Text;
    private messageText!: Phaser.GameObjects.Text;
    private scoreText!: Phaser.GameObjects.Text;
    private highScoreText!: Phaser.GameObjects.Text;
    private retryText!: Phaser.GameObjects.Text;
    private menuText!: Phaser.GameObjects.Text;
    private bg!: Phaser.GameObjects.Rectangle;
    private deathData: { reason?: string, score?: number, highScore?: number } = {};

    init(data: { reason?: string, score?: number, highScore?: number }) {
        this.deathData = data;

        // RESET ALL PROPERTIES to avoid "geom is null" error on restart
        this.titleText = undefined as any;
        this.messageText = undefined as any;
        this.scoreText = undefined as any;
        this.highScoreText = undefined as any;
        this.retryText = undefined as any;
        this.menuText = undefined as any;
        this.bg = undefined as any;
    }

    create() {

        // Input Cleanup
        this.input.keyboard?.removeAllListeners();

        this.createLayout();
        this.scale.on('resize', this.resize, this);

        // Blink effect
        this.tweens.add({
            targets: [this.retryText, this.menuText],
            alpha: 0.5,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Small delay prevents accidental instant restart
        this.time.delayedCall(300, () => {
            this.setupInput();
        });

        // Fake Achievement Check
        const achievement = MetaSystem.getAchievement();
        if (achievement) {
            this.showAchievement(achievement);
        }
    }

    createLayout() {
        const width = this.scale.width;
        const height = this.scale.height;
        const cx = width / 2;
        const cy = height / 2;

        // Background Overlay
        if (!this.bg) this.bg = this.add.rectangle(cx, cy, width, height, 0x000000, 0.9);
        else this.bg.setPosition(cx, cy).setSize(width, height);

        // Font Sizes
        const titleSize = Math.max(40, Math.min(width * 0.1, 80)) + "px";
        const msgSize = Math.max(24, Math.min(width * 0.05, 40)) + "px";
        const scoreSize = Math.max(32, Math.min(width * 0.08, 60)) + "px";
        const smallSize = Math.max(20, Math.min(width * 0.04, 30)) + "px";

        // Title
        if (!this.titleText) {
            this.titleText = this.add.text(cx, cy * 0.3, "YOU DIED", {
                fontSize: titleSize,
                color: "#ff4444",
                fontStyle: "bold"
            }).setOrigin(0.5);
        } else {
            this.titleText.setPosition(cx, cy * 0.3).setStyle({ fontSize: titleSize });
        }

        // Message
        let deathMessage = this.deathData?.reason || MetaSystem.getInsult();
        if (this.deathData?.reason) {
            deathMessage = `${this.deathData.reason}\n${MetaSystem.getInsult()}`;
        }

        if (!this.messageText) {
            this.messageText = this.add.text(cx, cy * 0.5, deathMessage, {
                fontSize: msgSize,
                color: "#ffffff",
                align: "center"
            }).setOrigin(0.5);
        } else {
            this.messageText.setPosition(cx, cy * 0.5).setStyle({ fontSize: msgSize });
        }

        // Scores
        const score = (this.deathData && typeof this.deathData.score === 'number') ? this.deathData.score : 0;
        const high = (this.deathData && typeof this.deathData.highScore === 'number') ? this.deathData.highScore : 0;

        if (!this.scoreText) {
            this.scoreText = this.add.text(cx, cy * 0.7, `SCORE: ${score}`, {
                fontSize: scoreSize,
                color: "#00ffff",
                fontStyle: "bold"
            }).setOrigin(0.5);
        } else {
            this.scoreText.setPosition(cx, cy * 0.7).setStyle({ fontSize: scoreSize });
        }

        if (!this.highScoreText) {
            this.highScoreText = this.add.text(cx, cy * 0.8, `HIGH SCORE: ${high}`, {
                fontSize: msgSize,
                color: "#ffff00"
            }).setOrigin(0.5);
        } else {
            this.highScoreText.setPosition(cx, cy * 0.8).setStyle({ fontSize: msgSize });
        }

        // Buttons
        if (!this.retryText) {
            this.retryText = this.add.text(cx, cy * 0.9, "[ PRESS ANY KEY TO RETRY ]", {
                fontSize: smallSize,
                color: "#aaaaaa"
            }).setOrigin(0.5);
        } else {
            this.retryText.setPosition(cx, cy * 0.9).setStyle({ fontSize: smallSize });
        }

        if (!this.menuText) {
            this.menuText = this.add.text(cx, cy * 0.98, "[ PRESS 'M' FOR MENU ]", {
                fontSize: smallSize,
                color: "#aaaaaa"
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        } else {
            this.menuText.setPosition(cx, cy * 0.98).setStyle({ fontSize: smallSize });
        }
    }

    setupInput() {
        // Restart Handler
        const restart = (event: KeyboardEvent) => {
            if (event.key && event.key.toUpperCase() === 'M') return;
            this.cleanupAndStart("Play");
        };

        // Menu Handler
        const goToMenu = () => {
            this.cleanupAndStart("Title");
        };

        this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
            if (event.key.toUpperCase() === 'M') {
                goToMenu();
            } else {
                restart(event);
            }
        });

        this.input.on("pointerdown", () => {
            this.cleanupAndStart("Play");
        });

        this.menuText.on('pointerdown', (_pointer: any, _localX: any, _localY: any, event: any) => {
            event.stopPropagation();
            goToMenu();
        });
    }

    cleanupAndStart(sceneKey: string) {
        this.scale.removeListener('resize', this.resize, this);
        this.scene.stop("Death");
        this.scene.start(sceneKey);
    }

    resize(gameSize: Phaser.Structs.Size) {
        this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
        this.createLayout();
    }

    showAchievement(text: string) {
        const cx = this.scale.width / 2;
        const width = this.scale.width;

        // Responsive achievement box
        const boxW = Math.min(400, width * 0.9);
        const titleSize = Math.max(12, Math.min(width * 0.03, 16)) + "px";
        const descSize = Math.max(14, Math.min(width * 0.045, 20)) + "px";

        // Drop down from top
        const bg = this.add.rectangle(cx, -50, boxW, 60, 0x333333).setOrigin(0.5);
        const title = this.add.text(cx, -65, "ACHIEVEMENT UNLOCKED", { fontSize: titleSize, color: "#ffff00" }).setOrigin(0.5);
        const desc = this.add.text(cx, -40, text, { fontSize: descSize, color: "#ffffff" }).setOrigin(0.5);

        // Group container not strictly needed for simple tween if we tween array
        const targets = [bg, title, desc];

        this.tweens.add({
            targets: targets,
            y: "+=100", // Move down 100px (to approx y=50)
            duration: 1000,
            ease: "Bounce.Out",
            onComplete: () => {
                this.time.delayedCall(3000, () => {
                    this.tweens.add({
                        targets: targets,
                        y: "-=100", // Move back up
                        duration: 500,
                        ease: "Power2" // Smooth exit
                    });
                });
            }
        });
    }
}
