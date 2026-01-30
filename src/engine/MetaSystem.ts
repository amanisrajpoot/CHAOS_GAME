import Phaser from "phaser";

export default class MetaSystem {
    private static readonly PATCH_NOTES = [
        "Removed Herobrine",
        "Added Skibidi Toilet Mode (Hidden)",
        "Nerfed Player Confidence",
        "Buffed Emotional Damage",
        "Optimized for 1999 Toasters",
        "Added Microtransactions (Just kidding... unless?)",
        "Fixed bug where you had rizz",
        "Updated EULA: We own your vibes",
        "Reduced hope by 69%",
        "Added invisible walls (Skill Issue)",
        "Implemented Tax Evasion mechanics"
    ];

    private static readonly ACHIEVEMENTS = [
        "Touch Grass (Impossible) 🌿",
        "Main Character Syndrome 🤡",
        "Certified Bot 🤖",
        "Emotional Damage 💔",
        "Cringe Compiler 😬",
        "Based Department Calling 📞",
        "Ohio Resident 🌽",
        "Giga Chad (Fake) 🗿",
        "Negative Rizz 📉",
        "Professional Yapper 🗣️"
    ];

    private static readonly INSULTS = [
        "Skill Issue",
        "L + Ratio",
        "Cringe",
        "Bro really tried",
        "Emotional Damage",
        "Imagine dying",
        "Common L",
        "Fatherless behavior",
        "Maidenless?",
        "Go touch grass",
        "Git gud",
        "Downloading skill...",
        "Error 404: Rizz not found",
        "Bot behavior",
        "NPC activity detected",
        "Bruh",
        "Delulu",
        "Yeet yourself"
    ];

    static getPatchNote(): string {
        const v = `v6.9.${Phaser.Math.Between(1, 420)}`;
        const note = Phaser.Math.RND.pick(this.PATCH_NOTES);
        return `${v} - ${note}`;
    }

    static getAchievement(): string | null {
        // 30% chance to mock the player
        if (Math.random() < 0.3) {
            return Phaser.Math.RND.pick(this.ACHIEVEMENTS);
        }
        return null;
    }



    static getInsult(): string {
        return Phaser.Math.RND.pick(this.INSULTS);
    }
}
