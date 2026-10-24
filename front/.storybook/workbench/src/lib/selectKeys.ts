// The keys that move the canvas selection through the story's DOM.

const OVERLAY = '[data-wb-overlay], [data-wb-held]';
const SKIP = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT', 'LINK']);

// Enter: the first child of the selection that is part of the story.
// `shows` can rule out a child that draws nothing (no size).
export const firstChildTarget = (
  el: Element,
  shows: (child: Element) => boolean = () => true
): Element | null => {
  for (const child of Array.from(el.children)) {
    if (SKIP.has(child.tagName) || child.matches(OVERLAY)) continue;
    if (shows(child)) return child;
  }
  return null;
};

export type NestKey = 'parent' | 'child' | null;

// Figma's keys: Shift+Enter, `\` and Esc select the parent, Enter the first
// child.
export const nestKey = (e: {
  key: string;
  shiftKey: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
}): NestKey => {
  if (e.altKey || e.ctrlKey || e.metaKey) return null;
  if (e.key === 'Escape' || e.key === '\\') return 'parent';
  if (e.key === 'Enter') return e.shiftKey ? 'parent' : 'child';
  return null;
};
