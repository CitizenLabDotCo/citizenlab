import React from 'react';

// components
import { Header, Row, HeaderCell } from 'components/admin/Table';
import Checkbox from 'components/UI/Checkbox';
import { SortableHeaderCell } from './IdeaHeaderRow';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../../messages';

// styling
import { colors } from 'utils/styleUtils';

// utils
import { roundPercentage } from 'utils/math';

// typings
import { SortAttribute as InitiativesSortAttribute } from 'resources/GetInitiatives';
import { SortDirection } from 'utils/paginationUtils';

const TOTAL_WIDTH = 11;
const getWidth = (width: number) => `${roundPercentage(width, TOTAL_WIDTH)}%`;

interface Props {
  sortAttribute?: InitiativesSortAttribute;
  sortDirection?: SortDirection;
  allSelected: boolean;
  toggleSelectAll: () => void;
  handleSortClick: (newSortAttribute: InitiativesSortAttribute) => () => void;
}

export default ({
  sortAttribute,
  sortDirection,
  allSelected,
  toggleSelectAll,
  handleSortClick,
}: Props) => (
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
        <FormattedMessage {...messages.title} />
      </HeaderCell>
      <HeaderCell width={getWidth(2)}>
        <FormattedMessage {...messages.assignee} />
      </HeaderCell>
      <SortableHeaderCell
        width={getWidth(2)}
        sortAttribute={sortAttribute}
        sortDirection={sortDirection}
        sortAttributeName="new"
        onChange={handleSortClick('new')}
      >
        <FormattedMessage {...messages.remainingTime} />
      </SortableHeaderCell>
      <SortableHeaderCell
        width={getWidth(1)}
        sortAttribute={sortAttribute}
        sortDirection={sortDirection}
        sortAttributeName="upvotes_count"
        onChange={handleSortClick('upvotes_count')}
      >
        <FormattedMessage {...messages.votes} />
      </SortableHeaderCell>
      <HeaderCell width={getWidth(1)}>
        <FormattedMessage {...messages.comments} />
      </HeaderCell>
    </Row>
  </Header>
);
