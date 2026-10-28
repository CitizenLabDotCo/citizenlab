// Focus helpers for the phone sheets (the nav menu, the canvas settings).

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])';

// The visible items Tab can reach inside `root`.
export const focusables = (root: HTMLElement | null): HTMLElement[] =>
  root
    ? [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null && el.tabIndex >= 0
      )
    : [];

// Keeps Tab and Shift+Tab inside the element.
export const trapTab = (e: KeyboardEvent, root: HTMLElement | null) => {
  const items = focusables(root);
  const first = items[0];
  const last = items[items.length - 1];
  if (!root || !first || !last) return;
  const active = document.activeElement;
  if (e.shiftKey && (active === first || !root.contains(active))) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && (active === last || !root.contains(active))) {
    e.preventDefault();
    first.focus();
  }
};
