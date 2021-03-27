import React from 'react';
import { Table } from 'semantic-ui-react';
import Checkbox from 'components/UI/Checkbox';
import { FormattedMessage } from 'utils/cl-intl';
import SortableTableHeader from 'components/admin/SortableTableHeader';
import messages from '../../messages';
import { TableHeaderCellText } from '.';

export default ({
  sortAttribute,
  sortDirection,
  allSelected,
  toggleSelectAll,
  handleSortClick,
}) => (
  <Table.Header>
    <Table.Row>
      <Table.HeaderCell width={1}>
        <Checkbox
          checked={!!allSelected}
          onChange={toggleSelectAll}
          size="21px"
        />
      </Table.HeaderCell>
      <Table.HeaderCell width={4}>
        <TableHeaderCellText>
          <FormattedMessage {...messages.title} />
        </TableHeaderCellText>
      </Table.HeaderCell>
      <Table.HeaderCell width={2}>
        <TableHeaderCellText>
          <FormattedMessage {...messages.assignee} />
        </TableHeaderCellText>
      </Table.HeaderCell>
      <Table.HeaderCell width={2}>
        <SortableTableHeader
          direction={sortAttribute === 'new' ? sortDirection : null}
          onToggle={handleSortClick('new')}
        >
          <TableHeaderCellText>
            <FormattedMessage {...messages.remainingTime} />
          </TableHeaderCellText>
        </SortableTableHeader>
      </Table.HeaderCell>
      <Table.HeaderCell width={1}>
        <SortableTableHeader
          direction={sortAttribute === 'upvotes_count' ? sortDirection : null}
          onToggle={handleSortClick('upvotes_count')}
        >
          <TableHeaderCellText>
            <FormattedMessage {...messages.votes} />
          </TableHeaderCellText>
        </SortableTableHeader>
      </Table.HeaderCell>
      <Table.HeaderCell width={1}>
        <TableHeaderCellText>
          <FormattedMessage {...messages.comments} />
        </TableHeaderCellText>
      </Table.HeaderCell>
    </Table.Row>
  </Table.Header>
);
