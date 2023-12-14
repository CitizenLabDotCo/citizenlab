import React from 'react';

// components
import {
  Thead,
  Tr,
  Th,
  Checkbox,
  colors,
} from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../../messages';

// utils
import { roundPercentage } from 'utils/math';

// typings
import { Sort as InitiativesSortAttribute } from 'api/initiatives/types';
import { SortDirection } from 'utils/paginationUtils';
import useInitiativeCosponsorsRequired from 'containers/InitiativesShow/hooks/useInitiativeCosponsorsRequired';
import SortableHeaderCell from './SortableHeaderCell';

interface Props {
  sortAttribute?: InitiativesSortAttribute;
  sortDirection?: SortDirection;
  allSelected: boolean;
  toggleSelectAll: () => void;
  handleSortClick: (newSortAttribute: InitiativesSortAttribute) => () => void;
}

const InitiativesHeaderRow = ({
  sortAttribute,
  sortDirection,
  allSelected,
  toggleSelectAll,
  handleSortClick,
}: Props) => {
  const cosponsorsRequired = useInitiativeCosponsorsRequired();

  const getWidth = (width: number) => `${roundPercentage(width, 11)}%`;

  return (
    <Thead>
      <Tr background={colors.grey50}>
        <Th width={getWidth(1)}>
          <Checkbox
            checked={!!allSelected}
            onChange={toggleSelectAll}
            size="21px"
          />
        </Th>
        <Th width={getWidth(4)}>
          <FormattedMessage {...messages.title} />
        </Th>
        <Th width={getWidth(2)}>
          <FormattedMessage {...messages.assignee} />
        </Th>
        <SortableHeaderCell
          width={getWidth(1)}
          sortAttribute={sortAttribute}
          sortDirection={sortDirection}
          sortAttributeName="likes_count"
          onChange={handleSortClick('likes_count')}
        >
          <FormattedMessage {...messages.votes} />
        </SortableHeaderCell>
        <Th width={getWidth(1)}>
          <FormattedMessage {...messages.comments} />
        </Th>
        {cosponsorsRequired && (
          <Th width={getWidth(1)}>
            <FormattedMessage {...messages.cosponsors} />
          </Th>
        )}
        <SortableHeaderCell
          width={getWidth(2)}
          sortAttribute={sortAttribute}
          sortDirection={sortDirection}
          sortAttributeName="new"
          onChange={handleSortClick('new')}
        >
          <FormattedMessage {...messages.publication_date} />
        </SortableHeaderCell>
      </Tr>
    </Thead>
  );
};

export default InitiativesHeaderRow;
