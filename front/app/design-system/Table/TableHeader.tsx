import React, { ReactNode, useContext } from 'react';

import {
  Column as AriaColumn,
  TableHeader as AriaTableHeader,
} from 'react-aria-components';

import { useIntl } from 'utils/cl-intl';

import Checkbox from '../Checkbox';

import messages from './messages';
import SelectionLabelsContext from './SelectionLabelsContext';
import styles from './TableHeader.module.css';
import '../tokens.css';

type TableHeaderProps = {
  // ColumnHeader children.
  children: ReactNode;
  // The + that adds a column: an IconButton Ghost 28 inside a MenuTrigger.
  addColumn?: ReactNode;
};

// The last column is a 28 px slot for the add-column control; each Row fills it with an empty cell.
const TableHeader = ({ children, addColumn }: TableHeaderProps) => {
  const { formatMessage } = useIntl();
  const selectionLabels = useContext(SelectionLabelsContext);

  return (
    <AriaTableHeader className={styles.header}>
      {selectionLabels && (
        <AriaColumn
          id="selection"
          width={28}
          minWidth={28}
          className={styles.selection}
        >
          <Checkbox slot="selection" aria-label={selectionLabels.selectAll} />
        </AriaColumn>
      )}
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
