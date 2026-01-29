import Phaser from "phaser";
import MetaSystem from "../engine/MetaSystem";

export default class TitleScene extends Phaser.Scene {
    constructor() {
        super("Title");
    }

    create() {
        const centerX = 400;

        // Background
        this.add.rectangle(0, 0, 800, 600, 0x110011).setOrigin(0);

        // Cyberpunk Sun (Small version)
        this.add.circle(centerX, 450, 40, 0xff00cc).setAlpha(0.5);

        // Title Text
        const title = this.add.text(centerX, 200, "YOU ARE NOT\nTHE PLAYER", {
            fontSize: "60px",
            color: "#ffffff",
            align: "center",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // Text Wobble
        this.tweens.add({
            targets: title,
            scale: 1.05,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        // Fake Patch Note
        const note = MetaSystem.getPatchNote();
        this.add.text(centerX, 550, note, {
            fontSize: "16px",
            color: "#00ff00",
            backgroundColor: "#000000"
        }).setOrigin(0.5);

        // STREAMER MODE TOGGLE
        let streamerMode = false;
        const streamerText = this.add.text(centerX, 480, "[ S ] STREAMER MODE: OFF", {
            fontSize: "18px",
            color: "#666666"
        }).setOrigin(0.5);

        this.input.keyboard?.on("keydown-S", () => {
            streamerMode = !streamerMode;
            streamerText.setText(`[ S ] STREAMER MODE: ${streamerMode ? "ON 💀" : "OFF"}`);
            streamerText.setColor(streamerMode ? "#ff0000" : "#666666");
            this.sound.play(streamerMode ? "error" : "glitch");
        });

        // CHAOS LEVEL SLIDER
        let chaosStart = 0;
        const chaosText = this.add.text(centerX, 500, "STARTING CHAOS: 0%", {
            fontSize: "18px",
            color: "#666666"
        }).setOrigin(0.5);

        const updateChaosText = () => {
            const percent = Math.round(chaosStart * 100);
            chaosText.setText(`[↑/↓] STARTING CHAOS: ${percent}%`);
            chaosText.setColor(Phaser.Display.Color.Interpolate.ColorWithColor(
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

        // Prompt
        const prompt = this.add.text(centerX, 400, "TAP OR PRESS TO SUFFER", {
            fontSize: "20px",
            color: "#aaaaaa"
        }).setOrigin(0.5);

        this.tweens.add({
            targets: prompt,
            alpha: 0,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Input
        this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
            const k = event.key.toUpperCase();
            if (k === "S" || k === "ARROWUP" || k === "ARROWDOWN") return;
            this.scene.start("Play", { streamerMode, chaosLevel: chaosStart });
        });

        this.input.on("pointerdown", () => {
            this.scene.start("Play", { streamerMode, chaosLevel: chaosStart });
        });
    }
}
