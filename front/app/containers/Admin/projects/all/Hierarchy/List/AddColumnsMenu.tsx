import React from 'react';

import {
  Box,
  Button,
  Dropdown,
  Tooltip,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import AnchoredLayer from '../Menu/AnchoredLayer';
import CheckRow from '../Menu/CheckRow';
import { getMenuSide } from '../Menu/menuSide';
import useAnchoredMenu from '../Menu/useAnchoredMenu';
import messages from '../messages';

import { COLUMNS, addableColumns } from './columns';
import useAddedColumns from './useAddedColumns';

// "+" at the end of the header: toggles the columns that aren't shown by
// default.
const AddColumnsMenu = () => {
  const { formatMessage } = useIntl();
  const { anchor, opened, toggle, close, layer, button } = useAnchoredMenu();
  const { added, toggleColumn } = useAddedColumns();
  const { isRtl } = useTheme();
  const label = formatMessage(messages.addColumns);
  // Lined up with the button's right edge, as the table ends there.
  const side = getMenuSide('right', isRtl);

  return (
    <Box display="flex" justifyContent="flex-end">
      <Tooltip
        content={label}
        placement="bottom"
        theme="dark"
        disabled={opened}
      >
        <Button
          ref={button}
          type="button"
          buttonStyle="bo-text"
          icon="plus"
          iconSize="16px"
          iconColor={colors.coolGrey600}
          padding="4px"
          ariaLabel={label}
          ariaExpanded={opened}
          ariaHasPopup="menu"
          onClick={toggle}
        />
      </Tooltip>
      <AnchoredLayer anchor={anchor} layer={layer}>
        <Dropdown
          opened
          onClickOutside={close}
          right={side === 'right' ? '0px' : undefined}
          left={side === 'left' ? '0px' : undefined}
          top="calc(100% + 4px)"
          width="240px"
          borderRadius={bo.panelBorderRadius}
          content={
            <Box role="menu" aria-label={label} py="1px">
              {addableColumns.map((column) => (
                <CheckRow
                  key={column}
                  label={formatMessage(COLUMNS[column].label)}
                  checked={added.includes(column)}
                  onToggle={() => toggleColumn(column)}
                />
              ))}
            </Box>
          }
        />
      </AnchoredLayer>
    </Box>
  );
};

export default AddColumnsMenu;
