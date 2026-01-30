export const PALETTES = {
    NEON_NIGHTS: {
        skyTop: 0x000000,
        skyBottom: 0x220033,
        sun: 0xff00cc,
        sunGlow: 0xff0066,
        grid: 0x00ffff,
        roadLight: 0x111111,
        roadDark: 0x0a0a0a,
        laneStripes: 0xffffff,
        neonTrail: 0x00ffff,
        gridFloor: 0x220044 // Dark purple grid floor
    },
    VAPORWAVE: {
        skyTop: 0x330033,
        skyBottom: 0xff66cc,
        sun: 0xffff00,
        sunGlow: 0xff9900,
        grid: 0x00ffcc,
        roadLight: 0x220022,
        roadDark: 0x110011,
        laneStripes: 0xff88ff,
        neonTrail: 0xff00cc,
        gridFloor: 0x001133 // Deep blue grid floor
    }
};

export const CONSTANTS = {
    focalLength: 300,
    cameraHeight: 120, // Restored to ~100 (original) to keep player on screen
    segmentLength: 200, // Length of each road segment in Z units
    drawDistance: 3000 // How far we can see
};
