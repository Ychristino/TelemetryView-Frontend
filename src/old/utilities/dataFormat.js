export function toTitleCase(str) {
    const spaced = str.replace(/([A-Z])/g, ' $1').trim();
    return spaced.replace(/\b\w/g, c => c.toUpperCase());
}

