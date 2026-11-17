import React, { ReactNode } from 'react';

import {
  Column as AriaColumn,
  TableHeader as AriaTableHeader,
} from 'react-aria-components';

import { useIntl } from 'utils/cl-intl';

import '../tokens.css';

import messages from './messages';
import styles from './TableHeader.module.css';

type TableHeaderProps = {
  // ColumnHeader children.
  children: ReactNode;
  // The + that adds a column: an IconButton Ghost 28 inside a MenuTrigger.
  addColumn?: ReactNode;
};

// The last column is a 28 px slot for the add-column control; each Row fills it with an empty cell.
const TableHeader = ({ children, addColumn }: TableHeaderProps) => {
  const { formatMessage } = useIntl();

  return (
    <AriaTableHeader className={styles.header}>
      {children}
      <AriaColumn
        id="actions"
        width={28}
        minWidth={28}
        aria-label={formatMessage(messages.actionsColumn)}
        className={styles.actions}
      >
        {addColumn}
      </AriaColumn>
    </AriaTableHeader>
  );
};

export default TableHeader;
