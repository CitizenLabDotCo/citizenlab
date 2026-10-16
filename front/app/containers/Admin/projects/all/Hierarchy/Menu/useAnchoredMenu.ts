import { MouseEvent, useEffect, useState } from 'react';

import useMenuButton from './useMenuButton';

// A menu that floats over the page, pinned to where its button was. Table
// cells and the table's scroll area cut off whatever overflows them; they don't
// cut off a fixed layer. Scrolling anything but the menu would leave it
// behind, so it closes.
const useAnchoredMenu = () => {
  const {
    opened,
    toggle: toggleMenu,
    close,
    button,
    menu: layer,
  } = useMenuButton();
  // Where the button was on screen when the menu opened.
  const [anchor, setAnchor] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!opened) return;

    const closeOnScroll = (event: Event) => {
      if (
        event.target instanceof Node &&
        layer.current?.contains(event.target)
      ) {
        return;
      }
      close();
    };

    window.addEventListener('scroll', closeOnScroll, true);
    window.addEventListener('resize', closeOnScroll);
    return () => {
      window.removeEventListener('scroll', closeOnScroll, true);
      window.removeEventListener('resize', closeOnScroll);
    };
  }, [opened, close, layer]);

  const toggle = (event: MouseEvent) => {
    setAnchor(event.currentTarget.getBoundingClientRect());
    toggleMenu(event);
  };

  return {
    anchor: opened ? anchor : null,
    opened,
    toggle,
    close,
    layer,
    button,
  };
};

export default useAnchoredMenu;
