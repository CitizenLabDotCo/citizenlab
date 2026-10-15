import React, { useState } from 'react';

import {
  Box,
  Button,
  CheckboxWithLabel,
  Dropdown,
  Tooltip,
  colors,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import { COLUMNS, addableColumns } from './columns';
import useAddedColumns from './useAddedColumns';

// "+" at the end of the header: toggles the columns that aren't shown by
// default.
const AddColumnsMenu = () => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);
  const { added, toggleColumn } = useAddedColumns();
  const label = formatMessage(messages.addColumns);

  return (
    <Box position="relative" display="flex" justifyContent="flex-end">
      <Tooltip content={label} placement="bottom" disabled={opened}>
        <Button
          type="button"
          buttonStyle="bo-text"
          icon="plus"
          iconSize="16px"
          iconColor={colors.coolGrey600}
          padding="4px"
          ariaLabel={label}
          ariaExpanded={opened}
          ariaHasPopup="true"
          onClick={() => setOpened(!opened)}
        />
      </Tooltip>
      <Dropdown
        opened={opened}
        onClickOutside={() => setOpened(false)}
        right="0px"
        top="32px"
        content={
          <Box p="4px">
            {addableColumns.map((column) => (
              <Box key={column} px="8px" py="6px">
                <CheckboxWithLabel
                  checked={added.includes(column)}
                  onChange={() => toggleColumn(column)}
                  label={formatMessage(COLUMNS[column].label)}
                  size="16px"
                />
              </Box>
            ))}
          </Box>
        }
      />
    </Box>
  );
};

export default AddColumnsMenu;
