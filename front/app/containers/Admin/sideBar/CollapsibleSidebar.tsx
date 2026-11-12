import React, { useLayoutEffect, useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

import Sidebar from './index';

const SidebarOverlay = styled.div<{ offset: number }>`
  position: fixed;
  top: ${({ offset }) => offset}px;
  bottom: 0;
  left: 0;
  z-index: 0;

  > div > nav {
    top: ${({ offset }) => offset}px;
  }
`;

const CollapsibleSidebar = () => {
  const [opened, setOpened] = useState(false);
  const { formatMessage } = useIntl();
  const [position, setPosition] = useState({ top: 8, left: 8 });

  // The navigation lives outside the workspace; notices can shift its header.
  useLayoutEffect(() => {
    let header: Element | null = null;
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
    const syncHeader = () => {
      const next = document.querySelector('[data-project-workspace-header]');
      if (next === header) return;
      header = next;
      resize.disconnect();
      if (header?.parentElement) {
        Array.from(header.parentElement.children).forEach((element) =>
          resize.observe(element)
        );
      }
      place();
    };
    const mutation = new MutationObserver(syncHeader);
    mutation.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', place);
    syncHeader();
    return () => {
      mutation.disconnect();
      resize.disconnect();
      window.removeEventListener('resize', place);
    };
  }, []);

  return (
    <Box
      position="fixed"
      top={`${position.top}px`}
      left={`${position.left}px`}
      zIndex="3000"
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
      <Box position="relative" zIndex="1">
        <Button
          buttonStyle="bo-text"
          icon="panel-left"
          width="40px"
          height="48px"
          padding="0"
          ariaLabel={formatMessage(messages.platformNavigation)}
          ariaExpanded={opened}
          onClick={() => setOpened(true)}
        />
      </Box>
      {opened && (
        <SidebarOverlay offset={Math.max(0, position.top - 8)}>
          <Sidebar />
        </SidebarOverlay>
      )}
    </Box>
  );
};

export default CollapsibleSidebar;
