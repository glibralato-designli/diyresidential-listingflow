/* Thin wrapper around the Lucide web font (loaded via CDN in index.html).
   Usage: icon('house') returns markup; call refreshIcons() after injecting
   into the DOM so Lucide swaps the <i> placeholders for real <svg>. */

function icon(name, size) {
  const sizeAttr = size ? ` style="width:${size}px;height:${size}px"` : '';
  return `<i data-lucide="${name}" class="icon"${sizeAttr}></i>`;
}

function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}
