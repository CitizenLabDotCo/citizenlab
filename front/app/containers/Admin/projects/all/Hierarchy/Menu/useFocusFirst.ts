import { useCallback, useRef } from 'react';

// A ref for a flyout: once it's on screen, its first choice takes the focus,
// when it was opened from the keyboard.
const useFocusFirst = (takeFocus: boolean) => {
  const focused = useRef(false);

  return useCallback(
    (node: HTMLElement | null) => {
      const first = node?.querySelector('button');
      if (takeFocus && first && !focused.current) {
        focused.current = true;
        first.focus();
      }
    },
    [takeFocus]
  );
};

export default useFocusFirst;
