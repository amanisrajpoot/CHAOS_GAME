import Phaser from "phaser";
import PlayScene from "./scenes/PlayScene";
import DeathScene from "./scenes/DeathScene";
import PreloadScene from "./scenes/PreloadScene";
import TitleScene from "./scenes/TitleScene";

new Phaser.Game({
    type: Phaser.AUTO, // Switch to WebGL for shaders/particles
    backgroundColor: "#000000",
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [PreloadScene, TitleScene, PlayScene, DeathScene]
});
