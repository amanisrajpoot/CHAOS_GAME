import Phaser from "phaser";

export enum ObstacleType {
    DEADLY = "DEADLY",
    FAKE = "FAKE"
}

export interface ObstacleConfig {
    emoji: string;
    type: ObstacleType;
}

export default class ObstacleGenerator {
    private static readonly DEADLY_POOL = [
        "🧱", "🚫", "💣", "🔥", "🔪", "🛑", "🚧", "🗿"
    ];

    private static readonly FAKE_POOL = [
        "👻", // Ghost
        "💨", // Fart/Air
        "💭", // Thought
        "🕸️", // Web
        "🌫️", // Fog
        "🫧"  // Bubble
    ];

    static getNext(): ObstacleConfig {
        // 20% chance of fake obstacle to gaslight player
        if (Math.random() < 0.2) {
            return {
                emoji: Phaser.Math.RND.pick(this.FAKE_POOL),
                type: ObstacleType.FAKE
            };
        }

        return {
            emoji: Phaser.Math.RND.pick(this.DEADLY_POOL),
            type: ObstacleType.DEADLY
        };
    }
}
