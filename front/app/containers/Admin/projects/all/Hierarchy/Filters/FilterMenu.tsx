import React, { KeyboardEvent, useState } from 'react';

import {
  Box,
  Dropdown,
  DropdownListItem,
  Icon,
  Text,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import { Level } from '../level';
import messages from '../messages';
import ToolbarButton from '../ToolbarButton';

import DateFlyout from './DateFlyout';
import { FACETS, FacetKey, isListFacet } from './facets';
import OptionsFlyout from './OptionsFlyout';
import useFilters from './useFilters';

// Rows as dense as the rest of the back office.
const MenuItem = styled(DropdownListItem)`
  gap: 10px;
  padding: 6px 8px;
  margin-bottom: 0;
`;

// The menu is 240px wide; its flyout opens on its left, as the button sits at
// the right edge of the page.
const MENU_WIDTH = 240;

interface Props {
  level: Level;
}

// The filters, one row each. A row opens its choices beside the menu, on
// hover, click or an arrow key.
const FilterMenu = ({ level }: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);
  const [openFacet, setOpenFacet] = useState<FacetKey>();
  const [flyoutTop, setFlyoutTop] = useState(0);
  // Opened from the keyboard, the flyout takes the focus. Each keyboard
  // opening starts a new flyout, so it takes the focus again even when it's
  // the one already open.
  const [fromKeyboard, setFromKeyboard] = useState(false);
  const [keyboardOpenings, setKeyboardOpenings] = useState(0);
  const { facets, activeFacets, clearFilters } = useFilters(level);
  const label = formatMessage(messages.filter);

  const close = () => {
    setOpened(false);
    setOpenFacet(undefined);
  };

  const openFlyout = (key: FacetKey, row: HTMLElement, keyboard = false) => {
    setOpenFacet(key);
    setFlyoutTop(row.offsetTop);
    setFromKeyboard(keyboard);
    if (keyboard) setKeyboardOpenings((count) => count + 1);
  };

  const handleRowKeyDown =
    (key: FacetKey) => (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        openFlyout(key, event.currentTarget, true);
      }
    };

  return (
    <Box position="relative">
      <ToolbarButton
        icon="filter"
        label={label}
        isActive={activeFacets.length > 0}
        menuOpened={opened}
        onClick={() => (opened ? close() : setOpened(true))}
      />
      <Dropdown
        opened={opened}
        onClickOutside={close}
        right="0px"
        top="36px"
        width={`${MENU_WIDTH}px`}
        maxHeight="440px"
        content={
          <Box role="menu" aria-label={label}>
            {facets.map((key) => (
              <MenuItem
                key={key}
                type="button"
                role="menuitem"
                aria-haspopup="true"
                aria-expanded={openFacet === key}
                className={openFacet === key ? 'selected' : undefined}
                onMouseEnter={(event) => openFlyout(key, event.currentTarget)}
                onClick={(event) => openFlyout(key, event.currentTarget)}
                onKeyDown={handleRowKeyDown(key)}
              >
                <Icon
                  name={FACETS[key].icon}
                  width="15px"
                  height="15px"
                  fill={colors.coolGrey600}
                />
                <Box flex="1">
                  <Text as="span" m="0" variant="boControl">
                    {formatMessage(FACETS[key].label)}
                  </Text>
                </Box>
                <Icon
                  name="chevron-left"
                  width="14px"
                  height="14px"
                  fill={colors.coolGrey500}
                />
              </MenuItem>
            ))}
            {activeFacets.length > 0 && (
              <Box borderTop={`1px solid ${colors.grey200}`} mt="6px" pt="6px">
                <MenuItem
                  type="button"
                  role="menuitem"
                  onMouseEnter={() => setOpenFacet(undefined)}
                  onClick={() => {
                    clearFilters();
                    close();
                  }}
                >
                  <Icon
                    name="close"
                    width="15px"
                    height="15px"
                    fill={colors.red600}
                  />
                  <Text as="span" m="0" variant="boControl" color="red600">
                    {formatMessage(messages.clearAllFilters)}
                  </Text>
                </MenuItem>
              </Box>
            )}
          </Box>
        }
        footer={
          openFacet && (
            <Box
              position="absolute"
              top={`${flyoutTop}px`}
              right={`${MENU_WIDTH + 4}px`}
              width="240px"
              maxHeight="400px"
              overflowY="auto"
              p="6px"
              bgColor={colors.white}
              border={`1px solid ${colors.grey300}`}
              borderRadius={bo.panelBorderRadius}
            >
              {isListFacet(openFacet) ? (
                <OptionsFlyout
                  key={`${openFacet}-${keyboardOpenings}`}
                  facetKey={openFacet}
                  level={level}
                  takeFocus={fromKeyboard}
                />
              ) : (
                <DateFlyout
                  key={keyboardOpenings}
                  level={level}
                  takeFocus={fromKeyboard}
                />
              )}
            </Box>
          )
        }
      />
    </Box>
  );
};

export default FilterMenu;
