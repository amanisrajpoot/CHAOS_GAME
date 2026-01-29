import Phaser from "phaser";

export enum ChaosEventType {
    NONE = "NONE",
    INVERT_COLORS = "INVERT_COLORS",
    SCREEN_TILT = "SCREEN_TILT",
    FAKE_CHAT = "FAKE_CHAT",
    INPUT_SCRAMBLE = "INPUT_SCRAMBLE",
    FAKE_LAG = "FAKE_LAG",
    FAKE_DONATION = "FAKE_DONATION"
}

export default class ChaosEventManager {
    private static readonly CHAT_MESSAGES = [
        "LUL", "SO BAD", "???", "LAG?", "RIGGED", "BOT",
        "MY GRANDMA PLAYS BETTER", "F", "KEKW", "UNINSTALL",
        "INPUT LAG??", "DEV???", "CRINGE",
        "OMEGALUL", "POG", "Kappa", "Jebaited", "Pepega",
        "Throws?", "Throwing for content?",
        "PAID ACTOR", "SCRIPTED", "Clipped LUL",
        "My eyes hurt", "Gameplay?", "Tutorial level hard?",
        "PRESS F", "WINNABLE (No)", "DonoWall", "ModCheck",
        "EZ CLAP", "NOT LIKE THIS", "SCAMMED",
        "Controller died?", "Lag switch?", "Stream sniper?",
        "Backseat gaming initiated", "Try jumping?", "USE ABILITY",
        "He doesnt know", "PepeLaugh", "MonkaS", "Sadge",
        "Copium", "Pure Copium", "Skill gap", "Diff",
        "Jungle diff", "Top gap", "Mid gap", "Supp gap",
        "FF 15", "Go next", "GG", "GG WP", "No re",
        "Refund", "Chargeback", "Fraud", "Scam",
        "This game is broken", "Fix your game", "Small indie company",
        "Spaghetti code", " Potato server", "Wifi player",
        "Mobile gamer?", "Console player?", "Touchpad?",
        "Steering wheel player?", "Dance pad?", "Guitar hero controller?",
        "Voice controls?", "Playing blindfolded?",
        "Hacker?", "Aimbot?", "Wallhack?", "Spinbot?",
        "Reported", "Banned", "Mute him", "Timeout",
        "Sub mode only", "Ad break", "Roll ads",
        "Prime sub?", " Twitch prime?", "Free sub?",
        "Gifted 100 subs", "Hype train", "Level 5 Hype",
        "Golden Kappa", "Partner push",
        "Hi YouTube", "Hi Reddit", "Hi Mom",
        "First", "Second", "Dead chat", "Revive chat"
    ];

    static getEvent(chaosLevel: number): ChaosEventType {
        // Only trigger events if chaos is high enough (>0.05)
        if (chaosLevel < 0.05) return ChaosEventType.NONE;

        // 1% chance per frame (approx once every 1.5s at 60fps) is too high.
        // We want occasional bursts.
        if (Math.random() > 0.005 + (chaosLevel * 0.01)) return ChaosEventType.NONE;

        const r = Math.random();

        if (r < 0.3) return ChaosEventType.FAKE_CHAT;
        if (r < 0.5) return ChaosEventType.SCREEN_TILT;
        if (r < 0.7) return ChaosEventType.INVERT_COLORS;
        if (r < 0.85) return ChaosEventType.INPUT_SCRAMBLE;

        // High chaos event
        if (chaosLevel > 0.4 && r < 0.95) return ChaosEventType.FAKE_DONATION;

        return ChaosEventType.FAKE_LAG;
    }

    static getRandomChatMessage(): string {
        return Phaser.Math.RND.pick(this.CHAT_MESSAGES);
    }
}
