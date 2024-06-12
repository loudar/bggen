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

export function randomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%!@#$%^&*()_+-=';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

export function randomWord() {
    const words = ["the", "of", "and", "to", "a", "in", "that", "I", "it", "for", "not", "with", "be", "as", "you", "do", "at", "this", "but", "by", "from", "or", "an", "on", "your", "all", "was", "there", "we", "will", "home", "can", "my", "one", "has", "would", "time", "up", "their", "what", "so", "when", "about", "which", "people", "me", "out", "than", "into", "other", "than", "now", "first", "no", "may", "any", "these", "been", "then", "find", "get", "go", "made", "make", "like", "right", "into", "take", "year", "your", "good", "some", "over", "most", "think", "also", "back", "after", "use", "work", "well", "way", "even", "new", "want", "because", "how", "ask", "these", "two", "day", "come", "last", "first", "give", "set", "never", "under", "long", "too", "very", "just", "tell", "try", "think", "call", "look", "use", "want", "see", "come", "know", "get", "go", "make", "take", "give", "set", "never", "under", "long", "too", "very", "just", "tell", "try", "think", "call", "look", "use", "want", "see", "come", "know", "get", "go", "make", "take", "give", "set", "never", "under", "long", "too", "very", "just", "tell", "try", "think", "call", "look", "use", "want", "see", "come", "know", "get", "go", "make"];
    return randomOf(words);
}

export function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}