import { useContext, useEffect, useRef } from 'react';

import { ComboBoxStateContext } from 'react-aria-components';

// React Aria's ComboBox has no defaultOpen, so this opens it once from inside.
const OpenOnMount = () => {
  const state = useContext(ComboBoxStateContext);
  const hasOpened = useRef(false);

  // No dependency list: the options are collected after the first render and
  // opening an empty list does nothing, so this retries until the list is open.
  // Once it has been open, closing it is the user's call.
  useEffect(() => {
    if (hasOpened.current || !state) return;
    if (state.isOpen) {
      hasOpened.current = true;
      return;
    }
    // 'manual' lists every option, not only those matching the current value.
    state.open(null, 'manual');
  });

  return null;
};

export default OpenOnMount;
