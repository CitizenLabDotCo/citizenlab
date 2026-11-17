import React, { useLayoutEffect, useState } from 'react';

import IconButton from 'design-system/IconButton';
import 'design-system/tokens.css';

import { useIntl } from 'utils/cl-intl';

import styles from './CollapsibleSidebar.module.css';
import messages from './messages';
import { useWorkspaceHeader } from './WorkspaceHeaderContext';

import Sidebar from './index';

const CollapsibleSidebar = () => {
  const [opened, setOpened] = useState(false);
  const { formatMessage } = useIntl();
  const [position, setPosition] = useState({ top: 8, left: 8 });
  const header = useWorkspaceHeader()?.element;

  // The navigation lives outside the workspace; notices can shift its header.
  useLayoutEffect(() => {
    const place = () => {
      const rect = header?.getBoundingClientRect();
      const top = rect?.top ?? 8;
      const left = rect ? rect.left + 8 : 8;
      setPosition((previous) =>
        previous.top === top && previous.left === left
          ? previous
          : { top, left }
      );
    };
    const resize = new ResizeObserver(place);

    if (header?.parentElement) {
      Array.from(header.parentElement.children).forEach((element) =>
        resize.observe(element)
      );
    }
    window.addEventListener('resize', place);
    place();

    return () => {
      resize.disconnect();
      window.removeEventListener('resize', place);
    };
  }, [header]);

  return (
    // Tracks hover and focus within the trigger and the sidebar; the IconButton is the control.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={styles.anchor}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      onMouseEnter={() => setOpened(true)}
      onMouseLeave={() => setOpened(false)}
      onFocus={() => setOpened(true)}
      onBlur={(event) => {
        if (
          !(event.relatedTarget instanceof Node) ||
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          setOpened(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          setOpened(false);
        }
      }}
    >
      <div className={styles.trigger}>
        <IconButton
          icon="panel-left-16"
          aria-label={formatMessage(messages.platformNavigation)}
          aria-expanded={opened}
          onPress={() => setOpened(true)}
        />
      </div>
      {opened && (
        <div
          className={styles.overlay}
          style={{ top: `${Math.max(0, position.top - 8)}px` }}
        >
          <Sidebar />
        </div>
      )}
    </div>
  );
};

export default CollapsibleSidebar;
