export function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFromCenter(center, range, min = 0, max = 100) {
    let val = random(center - range, center + range);
    while (val < min) {
        val += max - min;
    }
    while (val > max) {
        val -= max - min;
    }
    return val;
}

export function randomColor(h, s, l, hv, sv, lv) {
    const hue = randomFromCenter(h, hv / 2, h - (hv / 2), h + (hv / 2));
    const saturation = randomFromCenter(s, sv / 2, s - (sv / 2), s + (sv / 2));
    const lightness = randomFromCenter(l, lv / 2, l - (lv / 2), l + (lv / 2));
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function randomOf(array) {
    return array[Math.floor(Math.random() * array.length)];
}