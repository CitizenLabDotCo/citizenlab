import React, { useEffect, useRef, useState } from 'react';

import {
  Box,
  colors,
  DropdownListItem,
  Icon,
  IconButton,
  IconNames,
  stylingConsts,
  Tooltip,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

export type PageMenuAction = {
  label: string;
  icon: IconNames;
  onClick: () => void;
  // When set, the action is shown disabled with this explanation.
  disabledReason?: string;
};

type Props = {
  actions: PageMenuAction[];
};

const MENU_WIDTH = 220;

// "..." button with a small menu that opens to its right. The menu is
// positioned against the viewport so the scrolling page list can't clip it.
const PageActionsMenu = ({ actions }: Props) => {
  const { formatMessage } = useIntl();
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const close = () => setPosition(null);

  // Close on a click outside, Escape, or when the page list scrolls (the
  // menu would no longer line up with its button).
  useEffect(() => {
    if (!position) return undefined;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (
        menuRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setPosition(null);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPosition(null);
    };
    const handleScroll = () => setPosition(null);

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [position]);

  const toggle = () => {
    if (position) {
      close();
      return;
    }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({ top: rect.top - 4, left: rect.right + 8 });
  };

  return (
    // Clicks in here belong to the menu, not to the page card around it.
    <Box
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <Box ref={triggerRef}>
        <IconButton
          iconName="dots-horizontal"
          buttonType="button"
          iconColor={colors.textSecondary}
          iconColorOnHover={colors.textPrimary}
          a11y_buttonActionMessage={formatMessage(messages.pageActions)}
          ariaExpanded={!!position}
          onClick={toggle}
          p="2px"
          data-cy="e2e-form-builder-new-page-actions"
        />
      </Box>
      {position && (
        <Box
          ref={menuRef}
          role="menu"
          position="fixed"
          top={`${position.top}px`}
          left={`${position.left}px`}
          w={`${MENU_WIDTH}px`}
          zIndex="20"
          p="4px"
          pb="0px"
          bgColor={colors.white}
          border={`1px solid ${colors.grey300}`}
          borderRadius={stylingConsts.borderRadius}
          boxShadow="0px 4px 12px rgba(0, 0, 0, 0.15)"
        >
          {actions.map((action) => {
            const item = (
              <DropdownListItem
                type="button"
                role="menuitem"
                disabled={!!action.disabledReason}
                onClick={() => {
                  close();
                  action.onClick();
                }}
              >
                <Box display="flex" alignItems="center" gap="8px">
                  <Icon
                    name={action.icon}
                    width="18px"
                    height="18px"
                    fill={
                      action.disabledReason
                        ? colors.grey400
                        : colors.textPrimary
                    }
                  />
                  {action.label}
                </Box>
              </DropdownListItem>
            );

            return action.disabledReason ? (
              // Disabled buttons don't get mouse events, so the tooltip
              // listens on a wrapper.
              <Tooltip
                key={action.label}
                content={action.disabledReason}
                placement="right"
                theme="dark"
              >
                <Box>{item}</Box>
              </Tooltip>
            ) : (
              <React.Fragment key={action.label}>{item}</React.Fragment>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default PageActionsMenu;
