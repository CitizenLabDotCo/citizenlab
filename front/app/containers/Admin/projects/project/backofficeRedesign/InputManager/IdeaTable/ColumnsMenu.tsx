import React from 'react';

import { Box, colors, IconButton } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import { ColumnKey, COLUMNS, orderColumns } from '../columns';
import MenuButton from '../MenuButton';
import messages from '../messages';
import OptionList from '../OptionList';

interface Props {
  columns: ColumnKey[];
  availableColumns: ColumnKey[];
  onChange: (columns: ColumnKey[]) => void;
}

const ColumnsMenu = ({ columns, availableColumns, onChange }: Props) => {
  const { formatMessage } = useIntl();

  const toggleColumn = (value: string) => {
    const column = availableColumns.find((column) => column === value);
    if (!column) return;

    onChange(
      columns.includes(column)
        ? columns.filter((visible) => visible !== column)
        : orderColumns([...columns, column])
    );
  };

  return (
    <MenuButton
      align="right"
      width="220px"
      trigger={({ toggle }) => (
        <Box display="flex" justifyContent="flex-end">
          <IconButton
            iconName="plus"
            iconWidth="18px"
            iconHeight="18px"
            iconColor={colors.coolGrey600}
            iconColorOnHover={colors.textPrimary}
            a11y_buttonActionMessage={formatMessage(messages.addColumns)}
            onClick={toggle}
          />
        </Box>
      )}
    >
      {() => (
        <OptionList
          options={availableColumns.map((column) => ({
            value: column,
            label: formatMessage(COLUMNS[column].label),
          }))}
          selected={columns}
          onToggle={toggleColumn}
        />
      )}
    </MenuButton>
  );
};

export default ColumnsMenu;
