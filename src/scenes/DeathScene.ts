import Phaser from "phaser";
import MetaSystem from "../engine/MetaSystem";

export default class DeathScene extends Phaser.Scene {
    constructor() {
        super("Death");
    }

    create(data: { reason?: string }) {
        // Block all previous input
        this.input.keyboard?.removeAllListeners();

        // Overlay
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.9);

        this.add
            .text(400, 240, "YOU DIED", {
                fontSize: "40px",
                color: "#ff4444"
            })
            .setOrigin(0.5);

        let deathMessage = data?.reason || MetaSystem.getInsult();

        // If the reason is the default "Your fault." or generic, override with insult sometimes?
        // Actually, PlayScene passes "Died to Emoji". That's good.
        // If data.reason is missing, use insult.
        // Also maybe append an insult?
        // Let's make it: "Died to 🤡\nSkill Issue"
        if (data?.reason) {
            deathMessage = `${data.reason}\n${MetaSystem.getInsult()}`;
        }

        this.add
            .text(400, 310, deathMessage, {
                fontSize: "20px",
                color: "#ffffff",
                align: "center"
            })
            .setOrigin(0.5);

        this.add
            .text(400, 420, "Press ANY KEY to retry", {
                fontSize: "14px",
                color: "#aaaaaa"
            })
            .setOrigin(0.5);

        // Small delay prevents accidental instant restart
        this.time.delayedCall(300, () => {
            const restart = () => {
                this.scene.stop("Death");
                this.scene.start("Play");
            };
            this.input.keyboard?.once("keydown", restart);
            this.input.once("pointerdown", restart);
        });

        // Fake Achievement Check
        const achievement = MetaSystem.getAchievement();
        if (achievement) {
            this.showAchievement(achievement);
        }
    }

    showAchievement(text: string) {
        // Drop down from top
        const bg = this.add.rectangle(400, -50, 400, 60, 0x333333).setOrigin(0.5);
        const title = this.add.text(400, -65, "ACHIEVEMENT UNLOCKED", { fontSize: "14px", color: "#ffff00" }).setOrigin(0.5);
        const desc = this.add.text(400, -40, text, { fontSize: "18px", color: "#ffffff" }).setOrigin(0.5);

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
