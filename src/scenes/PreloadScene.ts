import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super("Preload");
    }

    preload() {
        // This is where real assets will go later
        // this.load.audio('vine_boom', 'assets/sounds/vine_boom.mp3');

        // Create a visual loader just in case we add heavy assets later
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);

        this.load.on('progress', (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
        });
    }

    create() {
        this.scene.start("Title");
    }
}
