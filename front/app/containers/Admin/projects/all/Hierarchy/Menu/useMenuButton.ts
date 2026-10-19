import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react';

import { MENU_ITEMS } from './moveMenuFocus';

// A button and the menu it opens. Opened from the keyboard, the menu's first
// item takes the focus; closed from inside, the focus goes back to the button,
// as what had it is gone. A click elsewhere keeps the focus where it went.
const useMenuButton = () => {
  const [opened, setOpened] = useState(false);
  const [fromKeyboard, setFromKeyboard] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  // What holds the menu's items: the menu, or anything around it.
  const menu = useRef<HTMLDivElement>(null);

  // The items are on screen only once the menu has rendered open.
  useEffect(() => {
    if (opened && fromKeyboard) {
      menu.current?.querySelector<HTMLElement>(MENU_ITEMS)?.focus();
    }
  }, [opened, fromKeyboard]);

  const close = useCallback(() => {
    const active = document.activeElement;
    const focusInMenu =
      active !== button.current && !!menu.current?.contains(active);
    setOpened(false);
    if (focusInMenu) button.current?.focus();
  }, []);

  const toggle = (event: MouseEvent) => {
    if (opened) {
      close();
      return;
    }
    // A click from Enter or Space has no pointer behind it.
    setFromKeyboard(event.detail === 0);
    setOpened(true);
  };

  return { opened, toggle, close, button, menu };
};

export default useMenuButton;
