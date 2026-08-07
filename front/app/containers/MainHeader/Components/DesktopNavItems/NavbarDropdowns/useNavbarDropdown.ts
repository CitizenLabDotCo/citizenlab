import { FormEvent, useEffect, useState } from 'react';

import { useLocation } from 'utils/router';

// Open/close state shared by the navbar dropdown items: toggles on click,
// closes after navigating, and notifies the parent of state changes.
const useNavbarDropdown = (
  onDropdownStateChange?: (isOpen: boolean) => void
) => {
  const location = useLocation();
  const [opened, setOpened] = useState(false);

  // Close the dropdown after navigating to one of its items.
  useEffect(() => {
    setOpened(false);
  }, [location.pathname]);

  useEffect(() => {
    onDropdownStateChange?.(opened);
  }, [opened, onDropdownStateChange]);

  const toggle = (event: FormEvent) => {
    event.preventDefault();
    setOpened((prev) => !prev);
  };

  const close = () => setOpened(false);

  return { opened, toggle, close };
};

export default useNavbarDropdown;
