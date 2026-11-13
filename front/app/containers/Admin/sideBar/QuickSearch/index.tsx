import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Icon, Text, colors } from '@citizenlab/cl2-component-library';

import Modal, { MEDIUM_MODAL_WIDTH } from 'components/UI/Modal';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

import RailTooltip from '../RailTooltip';
import { StyledBox } from '../styles';
import useSidebarCollapsed from '../useSidebarCollapsed';

import messages from './messages';
import QuickSearchPanel from './QuickSearchPanel';
import useQuickSearchEntries from './useQuickSearchEntries';
import useRecents from './useRecents';

// Cmd+K on Mac and Ctrl+K elsewhere, as in most apps with a quick search.
const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent);
const shortcutLabel = isMac ? '⌘K' : 'Ctrl K';
const TITLE_ID = 'quick-search-title';

type Props = {
  userId: string;
};

const QuickSearch = ({ userId }: Props) => {
  const { formatMessage } = useIntl();
  const collapsed = useSidebarCollapsed();
  const [opened, setOpened] = useState(false);
  const [modalTop, setModalTop] = useState<number>();
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Loaded with the sidebar rather than on open, so results show up instantly.
  const entries = useQuickSearchEntries();
  const { recentKeys, currentKey } = useRecents(userId, entries);

  // Line the modal up with the Quick search item, and keep it there as
  // results change.
  const open = useCallback(() => {
    setModalTop(buttonRef.current?.getBoundingClientRect().top);
    setOpened(true);
  }, []);

  const close = () => setOpened(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Rich text editors already use Cmd+K to add a link, and mark the event
      // as handled when they do.
      if (event.defaultPrevented) return;

      // Compared directly rather than lowercased: some key events (e.g. from
      // browser autofill) arrive without a key.
      const isK = event.key === 'k' || event.key === 'K';
      if (isK && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        open();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <>
      <RailTooltip
        label={formatMessage(messages.quickSearch)}
        disabled={!collapsed}
      >
        <StyledBox
          as="button"
          ref={buttonRef}
          width={collapsed ? '56px' : '100%'}
          display="flex"
          alignItems="center"
          // Smaller and set apart from the menu below, as it's a tool rather
          // than a section.
          mb="12px"
          p={collapsed ? '6px 0' : '6px 16px'}
          justifyContent={collapsed ? 'center' : 'flex-start'}
          onClick={open}
          aria-label={formatMessage(messages.quickSearch)}
          aria-keyshortcuts="Meta+K Control+K"
          data-cy="e2e-quick-search-button"
        >
          <Icon name="search" fill={colors.coolGrey300} height="16px" />
          {!collapsed && (
            <Text
              color="grey400"
              fontSize="s"
              fontStyle="italic"
              ml="15px"
              my="0px"
              textAlign="left"
            >
              {formatMessage(messages.quickSearch)}
            </Text>
          )}
          {!collapsed && (
            <Text
              as="span"
              color="coolGrey300"
              fontSize="xs"
              ml="auto"
              my="0px"
              aria-hidden
            >
              {shortcutLabel}
            </Text>
          )}
        </StyledBox>
      </RailTooltip>
      {/* No visible header or close button: Escape or a click outside
          closes it. The hidden title gives the dialog its name. */}
      <Modal
        opened={opened}
        close={close}
        ariaLabelledBy={TITLE_ID}
        hideCloseButton
        variant="bo"
        width={MEDIUM_MODAL_WIDTH}
        padding="32px 24px 24px"
        fixedTop={modalTop}
      >
        <ScreenReaderOnly id={TITLE_ID}>
          {formatMessage(messages.quickSearch)}
        </ScreenReaderOnly>
        <QuickSearchPanel
          entries={entries}
          recentKeys={recentKeys}
          currentKey={currentKey}
          onSelect={close}
        />
      </Modal>
    </>
  );
};

export default QuickSearch;
