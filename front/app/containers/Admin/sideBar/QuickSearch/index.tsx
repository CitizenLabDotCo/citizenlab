import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import RailTooltip from '../RailTooltip';
import { StyledBox, StyledText } from '../styles';
import useSidebarCollapsed from '../useSidebarCollapsed';

import messages from './messages';
import QuickSearchPanel from './QuickSearchPanel';
import useQuickSearchEntries from './useQuickSearchEntries';
import useRecents from './useRecents';

// Cmd+K on Mac and Ctrl+K elsewhere, as in most apps with a quick search.
const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent);
const shortcutLabel = isMac ? '⌘K' : 'Ctrl K';

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

  // Line the modal up with the Find item, and keep it there as results change.
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

      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        open();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <>
      <RailTooltip label={formatMessage(messages.find)} disabled={!collapsed}>
        <StyledBox
          as="button"
          ref={buttonRef}
          width={collapsed ? '56px' : '100%'}
          display="flex"
          alignItems="center"
          p={collapsed ? '10px 0' : '10px 8px 10px 16px'}
          justifyContent={collapsed ? 'center' : 'flex-start'}
          onClick={open}
          aria-label={formatMessage(messages.find)}
          aria-keyshortcuts="Meta+K Control+K"
          data-cy="e2e-quick-search-button"
        >
          <Icon name="search" fill={colors.coolGrey300} height="20px" />
          {!collapsed && (
            <StyledText color="white" ml="15px" my="0px" textAlign="left">
              {formatMessage(messages.find)}
            </StyledText>
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
      <Modal
        opened={opened}
        close={close}
        header={formatMessage(messages.find)}
        variant="bo"
        width={560}
        fixedTop={modalTop}
      >
        <Box p="16px 24px 24px">
          <QuickSearchPanel
            entries={entries}
            recentKeys={recentKeys}
            currentKey={currentKey}
            onSelect={close}
          />
        </Box>
      </Modal>
    </>
  );
};

export default QuickSearch;
