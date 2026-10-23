import { useCallback, useState } from 'react';

// Whether the sidebar is folded to its icons; per viewer, kept in this
// browser when storage allows.
const KEY = 'gv-workbench-nav-collapsed';

const read = () => {
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

export const useNavCollapsed = () => {
  const [collapsed, setCollapsed] = useState(read);
  const toggle = useCallback(() => {
    setCollapsed((c) => {
      try {
        if (c) window.localStorage.removeItem(KEY);
        else window.localStorage.setItem(KEY, '1');
      } catch {
        // Storage can be off (a private window); the choice lasts this visit.
      }
      return !c;
    });
  }, []);
  return [collapsed, toggle] as const;
};
