import Phaser from "phaser";

export default class CharacterGenerator {
    private static readonly AVATARS = [
        "🤡", // Clown (The Player)
        "💀", // Dead
        "👽", // Alien
        "💩", // Poop
        "🤖", // Bot
        "🦄", // Special
        "🥶", // Frozen
        "🤬", // Raging
        "👺", // Monster
        "🧶", // Chaos
        "🐹", // Hamster
        "🧀", // Cheese
        "🌵", // Prickly
        "👻", // Ghost
        "🐔"  // Chicken
    ];

    static getRandomAvatar(): string {
        return Phaser.Math.RND.pick(this.AVATARS);
    }
}
