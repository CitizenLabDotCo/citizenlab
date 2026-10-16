import { KeyboardEvent } from 'react';

export const MENU_ITEMS = '[role^="menuitem"]';
// A flyout's search box comes before its items.
const STOPS = `input, ${MENU_ITEMS}`;

// Up and Down move the focus through a menu's items, round from the last to
// the first; Home and End go to either end. In a search box, Home and End are
// left to the caret.
const moveMenuFocus = (event: KeyboardEvent<HTMLElement>) => {
  const inField = event.target instanceof HTMLInputElement;
  const keys = inField
    ? ['ArrowDown', 'ArrowUp']
    : ['ArrowDown', 'ArrowUp', 'Home', 'End'];
  if (!keys.includes(event.key)) return;

  const stops = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>(STOPS)
  );
  if (stops.length === 0) return;

  const last = stops.length - 1;
  const current = stops.findIndex((stop) => stop === document.activeElement);
  const targets: Record<string, number> = {
    Home: 0,
    End: last,
    ArrowDown: current === last ? 0 : current + 1,
    ArrowUp: current <= 0 ? last : current - 1,
  };

  event.preventDefault();
  stops[targets[event.key]].focus();
};

export default moveMenuFocus;
