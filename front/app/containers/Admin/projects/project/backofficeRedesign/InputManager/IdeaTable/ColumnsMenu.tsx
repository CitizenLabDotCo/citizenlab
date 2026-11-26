import React from 'react';

import IconButton from 'design-system/IconButton';
import { MenuTrigger } from 'design-system/Menu';

import { useIntl } from 'utils/cl-intl';

import { ColumnKey, COLUMNS, orderColumns } from '../columns';
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
    <MenuTrigger>
      <IconButton
        icon="plus-16"
        aria-label={formatMessage(messages.addColumns)}
      />
      <OptionList
        aria-label={formatMessage(messages.addColumns)}
        options={availableColumns.map((column) => ({
          value: column,
          label: formatMessage(COLUMNS[column].label),
        }))}
        selected={columns}
        onToggle={toggleColumn}
      />
    </MenuTrigger>
  );
};

export default ColumnsMenu;
