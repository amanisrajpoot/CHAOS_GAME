import Phaser from "phaser";

export default class CharacterGenerator {
    private static readonly AVATARS = [
        "🤡", "💀", "👽", "💩", "🤖", "🦄", "🥶", "🤬", "👺", "👻",
        "🦍", "🌚", "🌝", "🍆", "🍑", "🚀", "💎", "🙌", "🦀", "👀",
        "🐸", "🗿", "🅱️", "💯", "🧢", "🐍", "🧟", "🧛", "🧞", "🦶"
    ];

    static getRandomAvatar(): string {
        return Phaser.Math.RND.pick(this.AVATARS);
    }
}
