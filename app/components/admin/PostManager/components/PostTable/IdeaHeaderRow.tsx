import React from 'react';
import { Table, Checkbox } from 'semantic-ui-react';
import { FormattedMessage } from 'utils/cl-intl';
import SortableTableHeader from 'components/admin/SortableTableHeader';
import InfoTooltip from 'components/admin/InfoTooltip';
import FeatureFlag from 'components/FeatureFlag';
import messages from '../../messages';
import { TableHeaderCellText } from '.';

export default ({ sortAttribute, sortDirection, allSelected, toggleSelectAll, handleSortClick }) => (
  <Table.Header>
    <Table.Row>
      <Table.HeaderCell width={1}>
        <Checkbox value={allSelected} onChange={toggleSelectAll} size="17px"/>
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
            <FormattedMessage {...messages.publication_date} />
          </TableHeaderCellText>
        </SortableTableHeader>
      </Table.HeaderCell>
      <Table.HeaderCell width={1}>
        <SortableTableHeader
          direction={sortAttribute === 'upvotes_count' ? sortDirection : null}
          onToggle={handleSortClick('upvotes_count')}
        >
          <TableHeaderCellText>
            <FormattedMessage {...messages.up} />
          </TableHeaderCellText>
        </SortableTableHeader>
      </Table.HeaderCell >
      <Table.HeaderCell width={1}>
        <SortableTableHeader
          direction={sortAttribute === 'downvotes_count' ? sortDirection : null}
          onToggle={handleSortClick('downvotes_count')}
        >
          <TableHeaderCellText>
            <FormattedMessage {...messages.down} />
          </TableHeaderCellText>
        </SortableTableHeader>
      </Table.HeaderCell>
      <FeatureFlag name="participatory_budgeting">
        <Table.HeaderCell width={1}>
          <SortableTableHeader
            direction={sortAttribute === 'baskets_count' ? sortDirection : null}
            onToggle={handleSortClick('baskets_count')}
          >
            <TableHeaderCellText>
              <FormattedMessage {...messages.participatoryBudgettingPicks} />
            </TableHeaderCellText>
            &nbsp;
            <InfoTooltip {...messages.basketsCountTooltip} size="small" position="top-left" />
          </SortableTableHeader>
        </Table.HeaderCell>
      </FeatureFlag>
    </Table.Row>
  </Table.Header>
);
