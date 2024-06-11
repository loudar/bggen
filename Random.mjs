export function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFromCenter(center, range, min = 0, max = 100) {
    let val = this.random(center - range, center + range);
    if (val < min) {
        val = max - (min - val);
    } else if (val > max) {
        val = min + (val - max);
    }
    return val;
}

export function randomColor(h, s, l, hv, sv, lv) {
    const hue = randomFromCenter(h, hv / 2, 0, 360);
    const saturation = randomFromCenter(s, sv / 2);
    const lightness = randomFromCenter(l, lv / 2);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function randomOf(array) {
    return array[Math.floor(Math.random() * array.length)];
}