import { MouseEvent, useEffect, useRef, useState } from 'react';

// A menu that floats over the page, pinned to where its button was. Table
// cells and the table's scroll area cut off whatever overflows them; they don't
// cut off a fixed layer. Scrolling anything but the menu would leave it
// behind, so it closes.
const useAnchoredMenu = () => {
  // Where the button is on screen while the menu is open.
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const layer = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const opened = anchor !== null;

  useEffect(() => {
    if (!opened) return;

    const close = (event: Event) => {
      if (
        event.target instanceof Node &&
        layer.current?.contains(event.target)
      ) {
        return;
      }
      setAnchor(null);
    };

    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [opened]);

  // Closing from inside the menu takes away what had the focus, so it goes
  // back to the button. A click elsewhere keeps it where it went.
  const close = () => {
    const focusInMenu = layer.current?.contains(document.activeElement);
    setAnchor(null);
    if (focusInMenu) button.current?.focus();
  };

  const toggle = (event: MouseEvent<HTMLElement>) => {
    setAnchor(opened ? null : event.currentTarget.getBoundingClientRect());
  };

  return { anchor, opened, toggle, close, layer, button };
};

export default useAnchoredMenu;
