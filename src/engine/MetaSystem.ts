import Phaser from "phaser";

export default class MetaSystem {
    private static readonly PATCH_NOTES = [
        "Removed Herobrine",
        "Nerfed Player Confidence",
        "Added Microtransactions (Hidden)",
        "Fixed a bug where you could win",
        "Updated localization files",
        "Buffed Gravity",
        "Optimized for Nokia 3310",
        "Added Battle Royale Mode (Disabled)",
        "Reduced hope by 15%",
        "Fixed typo in 'Game Over'",
        "Increased anxiety levels",
        "Balanced nothing",
        "Removed 'Fun' (Too OP)",
        "Added invisible walls everywhere",
        "Updated EULA: We own your soul",
        "Nerfed movement speed by 0.0001%",
        "Buffed enemy hitboxes",
        "Added 4k texture support (for text)",
        "Fixed exploit where player had fun",
        "Removed Single Player Campaign",
        "Added 'Skill Issue' detection algorithm",
        "Optimized crash reporter",
        "Added ray-tracing to the black background"
    ];

    private static readonly ACHIEVEMENTS = [
        "Participation Trophy 🏆",
        "You Tried 🌟",
        "Least Improved Player 📉",
        "Professional Dier 💀",
        "Input Lag Enjoyer 🎮",
        "Chaos Connoisseur 🌪️",
        "Gravity Tester 🍎",
        "Almost Good (Not Really) 🤏",
        "Floor Inspector 🔍",
        "Keyboard Smasher ⌨️",
        "Uninstall Speedrun Any% 🏃",
        "Certified Bot 🤖",
        "Emotional Damage 💔",
        "AFK Strategy User 💤",
        "Paid Actor 🎭",
        "NPC Energy 😐",
        "Controller Breaker 🎮",
        "Rage Quit Loading... 🤬",
        "Touched Grass (Fail) 🌿"
    ];

    private static readonly INSULTS = [
        "Skill Issue",
        "Have you tried trying?",
        "My grandma plays better",
        "Controller disconnected?",
        "Refund issued (Fake)",
        "Maybe try easy mode?",
        "Embarrassing...",
        "Lag? Sure...",
        "Input ignored (Intentionally)",
        "You died to a JPEG",
        "F in the chat",
        "Download more RAM",
        "Is your monitor on?",
        "Try using your hands",
        "Uninstalling...",
        "Error 404: Skill Not Found",
        "Git gud",
        "Even the AI is laughing",
        "Spectator Mode unlocked",
        "Task failed successfully",
        "Stop hitting yourself",
        "Loading excuse...",
        "Did you sneeze?",
        "Have you considered Candy Crush?",
        "My cat could do that",
        "Keyboard error: User not found",
        "Try plugging it in",
        "Nice faceplant",
        "Gravity 1 - 0 You",
        "Mission Failed, We'll get em next time",
        "Wasted",
        "You Died (Again)",
        "Insert Coin to Continue",
        "Please connect controller",
        "System overload: Too much fail",
        "Rebooting pride...",
        "Deleting System32...",
        "Alt+F4 saves the game",
        "Not like this...",
        "Bruh"
    ];

    static getPatchNote(): string {
        const v = `v0.9.${Phaser.Math.Between(1, 99)}`;
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
