import Phaser from "phaser";
import MetaSystem from "../engine/MetaSystem";

export default class TitleScene extends Phaser.Scene {
    private titleText!: Phaser.GameObjects.Text;
    private noteText!: Phaser.GameObjects.Text;
    private streamerText!: Phaser.GameObjects.Text;
    private chaosText!: Phaser.GameObjects.Text;
    private promptText!: Phaser.GameObjects.Text;
    private bg!: Phaser.GameObjects.Rectangle;
    private sun!: Phaser.GameObjects.Arc;

    constructor() {
        super("Title");
    }

    create() {
        this.createLayout();
        this.scale.on('resize', this.resize, this);

        // Input Setup (Separated from layout)
        let streamerMode = false;
        let chaosStart = 0;

        this.input.keyboard?.on("keydown-S", () => {
            streamerMode = !streamerMode;
            this.streamerText.setText(`[ S ] STREAMER MODE: ${streamerMode ? "ON 💀" : "OFF"}`);
            this.streamerText.setColor(streamerMode ? "#ff0000" : "#666666");
            this.sound.play(streamerMode ? "error" : "glitch");
        });

        const updateChaosText = () => {
            const percent = Math.round(chaosStart * 100);
            this.chaosText.setText(`[↑/↓] STARTING CHAOS: ${percent}%`);
            this.chaosText.setColor(Phaser.Display.Color.Interpolate.ColorWithColor(
                new Phaser.Display.Color(100, 100, 100),
                new Phaser.Display.Color(255, 0, 0),
                100, percent
            ).toString());
        };

        this.input.keyboard?.on("keydown-UP", () => {
            chaosStart = Math.min(chaosStart + 0.1, 1.0);
            updateChaosText();
        });

        this.input.keyboard?.on("keydown-DOWN", () => {
            chaosStart = Math.max(chaosStart - 0.1, 0);
            updateChaosText();
        });

        // Start Game Input
        const startGame = () => {
            this.scale.removeListener('resize', this.resize, this); // Clean up listener
            this.scene.start("Play", { streamerMode, chaosLevel: chaosStart });
        };

        this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
            const k = event.key.toUpperCase();
            if (k === "S" || k === "ARROWUP" || k === "ARROWDOWN") return;
            startGame();
        });

        this.input.on("pointerdown", startGame);
    }

    createLayout() {
        const width = this.scale.width;
        const height = this.scale.height;
        const cx = width / 2;
        const cy = height / 2;

        // Background
        if (!this.bg) this.bg = this.add.rectangle(0, 0, width, height, 0x110011).setOrigin(0);
        else this.bg.setSize(width, height);

        // Sun
        if (!this.sun) this.sun = this.add.circle(cx, cy * 1.5, height * 0.1, 0xff00cc).setAlpha(0.5);
        else this.sun.setPosition(cx, cy * 1.5).setRadius(height * 0.1);

        // Responsive Font Size
        // Responsive Font Size
        const titleSize = Math.max(30, Math.min(width * 0.12, 80)) + "px"; // Reduced max from 120 to 80
        const subtitleSize = Math.max(16, Math.min(width * 0.05, 40)) + "px";
        const smallSize = Math.max(16, Math.min(width * 0.04, 30)) + "px";

        // Title
        if (!this.titleText) {
            this.titleText = this.add.text(cx, cy * 0.6, "MEME RUNNER\nCHAOS EDITON", {
                fontSize: titleSize,
                color: "#00ffff",
                align: "center",
                fontStyle: "bold",
                stroke: "#ff00ff",
                strokeThickness: 6
            }).setOrigin(0.5);

            this.tweens.add({
                targets: this.titleText,
                scale: 1.05,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut"
            });
        } else {
            this.titleText.setPosition(cx, cy * 0.6).setStyle({ fontSize: titleSize });
        }

        // Prompt
        if (!this.promptText) {
            const prompts = ["PRESS ANY KEY TO VIBE", "TAP TO TOUCH GRASS", "ENTER THE CRINGE", "LETS GOOOOOO"];
            const txt = Phaser.Math.RND.pick(prompts);
            this.promptText = this.add.text(cx, cy * 1.2, txt, {
                fontSize: subtitleSize,
                color: "#00ff00",
                backgroundColor: "#000000",
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5);

            this.tweens.add({
                targets: this.promptText,
                alpha: 0,
                duration: 800,
                yoyo: true,
                repeat: -1
            });
        } else {
            this.promptText.setPosition(cx, cy * 1.2).setStyle({ fontSize: subtitleSize });
        }

        // Streamer Mode
        if (!this.streamerText) {
            this.streamerText = this.add.text(cx, cy * 1.5, "[ S ] STREAMER MODE: OFF", {
                fontSize: smallSize,
                color: "#666666"
            }).setOrigin(0.5);
        } else {
            this.streamerText.setPosition(cx, cy * 1.5).setStyle({ fontSize: smallSize });
        }

        // Chaos Text
        if (!this.chaosText) {
            this.chaosText = this.add.text(cx, cy * 1.6, "STARTING CHAOS: 0%", {
                fontSize: smallSize,
                color: "#666666"
            }).setOrigin(0.5);
        } else {
            this.chaosText.setPosition(cx, cy * 1.6).setStyle({ fontSize: smallSize });
        }

        // Patch Note
        if (!this.noteText) {
            const note = MetaSystem.getPatchNote();
            this.noteText = this.add.text(cx, height - 30, note, {
                fontSize: Math.min(width * 0.025, 16) + "px",
                color: "#00ff00",
                backgroundColor: "#000000"
            }).setOrigin(0.5);
        } else {
            this.noteText.setPosition(cx, height - 30).setStyle({ fontSize: Math.min(width * 0.025, 16) + "px" });
        }
    }

    resize(gameSize: Phaser.Structs.Size) {
        this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
        this.createLayout();
    }
}
