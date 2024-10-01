import React from 'react';

import {
  Thead,
  Tr,
  Th,
  Checkbox,
  colors,
} from '@citizenlab/cl2-component-library';

import { Sort as InitiativesSortAttribute } from 'api/initiatives/types';

import useInitiativeCosponsorsRequired from 'containers/InitiativesShow/hooks/useInitiativeCosponsorsRequired';

import { FormattedMessage } from 'utils/cl-intl';
import { SortDirection } from 'utils/paginationUtils';

import messages from '../../../messages';

import SortableHeaderCell from './SortableHeaderCell';

interface Props {
  sortAttribute?: InitiativesSortAttribute;
  sortDirection?: SortDirection;
  allSelected: boolean;
  toggleSelectAll: () => void;
  handleSortClick: (
    newSortAttribute: InitiativesSortAttribute,
    defaultSort?: 'ascending' | 'descending'
  ) => () => void;
}

const InitiativesHeaderRow = ({
  sortAttribute,
  sortDirection,
  allSelected,
  toggleSelectAll,
  handleSortClick,
}: Props) => {
  const cosponsorsRequired = useInitiativeCosponsorsRequired();

  return (
    <Thead>
      <Tr background={colors.grey50}>
        <Th>
          <Checkbox
            checked={!!allSelected}
            onChange={toggleSelectAll}
            size="21px"
          />
        </Th>
        <Th>
          <FormattedMessage {...messages.title} />
        </Th>
        <Th>
          <FormattedMessage {...messages.assignee} />
        </Th>
        <SortableHeaderCell
          sortAttribute={sortAttribute}
          sortDirection={sortDirection}
          sortAttributeName="likes_count"
          onChange={handleSortClick('likes_count')}
        >
          <FormattedMessage {...messages.votes} />
        </SortableHeaderCell>
        <SortableHeaderCell
          sortAttribute={sortAttribute}
          sortDirection={sortDirection}
          sortAttributeName="comments_count"
          onChange={handleSortClick('comments_count')}
        >
          <FormattedMessage {...messages.comments} />
        </SortableHeaderCell>
        {cosponsorsRequired && (
          <SortableHeaderCell
            sortAttribute={sortAttribute}
            sortDirection={sortDirection}
            sortAttributeName="accepted_cosponsorships_count"
            onChange={handleSortClick('accepted_cosponsorships_count')}
          >
            <FormattedMessage {...messages.cosponsors} />
          </SortableHeaderCell>
        )}
        <SortableHeaderCell
          sortAttribute={sortAttribute}
          sortDirection={sortDirection}
          sortAttributeName="new"
          onChange={handleSortClick('new', 'ascending')}
        >
          <FormattedMessage {...messages.publication_date} />
        </SortableHeaderCell>
      </Tr>
    </Thead>
  );
};

export default InitiativesHeaderRow;
