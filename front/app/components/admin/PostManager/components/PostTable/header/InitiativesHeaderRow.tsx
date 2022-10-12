import React from 'react';

// components
import { Header, Row, HeaderCell } from 'components/admin/Table';
import Checkbox from 'components/UI/Checkbox';
import SortableTableHeader from 'components/admin/SortableTableHeader';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../../messages';

// styling
import { colors } from 'utils/styleUtils';

// utils
import { roundPercentage } from 'utils/math';

// typings
import { TableHeaderCellText } from '..';

const TOTAL_WIDTH = 11;
const getWidth = (width: number) => `${roundPercentage(width, TOTAL_WIDTH)}%`;

export default ({
  sortAttribute,
  sortDirection,
  allSelected,
  toggleSelectAll,
  handleSortClick,
}) => (
  <Header background={colors.grey50}>
    <Row>
      <HeaderCell width={getWidth(1)}>
        <Checkbox
          checked={!!allSelected}
          onChange={toggleSelectAll}
          size="21px"
        />
      </HeaderCell>
      <HeaderCell width={getWidth(4)}>
        <TableHeaderCellText>
          <FormattedMessage {...messages.title} />
        </TableHeaderCellText>
      </HeaderCell>
      <HeaderCell width={getWidth(2)}>
        <TableHeaderCellText>
          <FormattedMessage {...messages.assignee} />
        </TableHeaderCellText>
      </HeaderCell>
      <HeaderCell width={getWidth(2)}>
        <SortableTableHeader
          direction={sortAttribute === 'new' ? sortDirection : null}
          onToggle={handleSortClick('new')}
        >
          <TableHeaderCellText>
            <FormattedMessage {...messages.remainingTime} />
          </TableHeaderCellText>
        </SortableTableHeader>
      </HeaderCell>
      <HeaderCell width={getWidth(1)}>
        <SortableTableHeader
          direction={sortAttribute === 'upvotes_count' ? sortDirection : null}
          onToggle={handleSortClick('upvotes_count')}
        >
          <TableHeaderCellText>
            <FormattedMessage {...messages.votes} />
          </TableHeaderCellText>
        </SortableTableHeader>
      </HeaderCell>
      <HeaderCell width={getWidth(1)}>
        <TableHeaderCellText>
          <FormattedMessage {...messages.comments} />
        </TableHeaderCellText>
      </HeaderCell>
    </Row>
  </Header>
);
