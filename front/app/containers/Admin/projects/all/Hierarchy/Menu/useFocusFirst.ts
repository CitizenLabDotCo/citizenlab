import { useRef } from 'react';

// A ref for a flyout: once it's on screen, its first field or choice takes the
// focus, when it was opened from the keyboard. The choices can still be
// loading when it opens: a new function each render makes React call it again
// on each one, until there's something to focus.
const useFocusFirst = (takeFocus: boolean, selector = 'button') => {
  const focused = useRef(false);

  return (node: HTMLElement | null) => {
    const first = node?.querySelector<HTMLElement>(selector);
    if (takeFocus && first && !focused.current) {
      focused.current = true;
      first.focus();
    }
  };
};

export default useFocusFirst;
