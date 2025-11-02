export function convertToTitleCase(str) {
  if (typeof str !== 'string' || str.trim() === '') {
    return '';
  }

  return str
    .toLowerCase()
    .split('_')
    .map(word => {
      if (word.length > 0) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return '';
    })
    .join(' ');
}