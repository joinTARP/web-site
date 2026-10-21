/** @param {{ version: string }} options */
export default function desktopVersionPlugin({ version }) {
  /** @param {{ type: 'text' | 'inlineCode', value: string }} node */
  function replace(node) {
    if (node.value.includes('{{desktopVersion}}')) {
      return {
        type: node.type,
        value: node.value.replaceAll('{{desktopVersion}}', version),
      };
    }
  }
  /** @param {{ fileURL?: URL }} context */
  return function forDocument({ fileURL }) {
    if (fileURL?.pathname.includes('/src/content/releases/')) return null;
    return { text: replace, inlineCode: replace };
  };
}
