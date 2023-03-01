import React from 'react';
import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IInitiativeStatusData } from 'services/initiativeStatuses';
import { Menu, Divider } from 'semantic-ui-react';
import FilterSidebarStatusesItem from './FilterSidebarStatusesItem';
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../../messages';

interface Props {
  statuses?: IIdeaStatusData[] | IInitiativeStatusData[] | null;
  selectedStatus?: string | null;
  onChangeStatusFilter?: (status: string | null) => void;
}

const FilterSidebarStatuses = ({
  statuses,
  selectedStatus,
  onChangeStatusFilter,
}: Props) => {
  const handleItemClick = (id: string) => () => {
    onChangeStatusFilter && onChangeStatusFilter(id);
  };

  const clearFilter = () => {
    onChangeStatusFilter && onChangeStatusFilter(null);
  };

  const isActive = (id: string) => {
    return selectedStatus === id;
  };

  if (!isNilOrError(statuses)) {
    return (
      <Menu secondary={true} vertical={true} fluid={true}>
        <Menu.Item onClick={clearFilter} active={!selectedStatus}>
          <FormattedMessage {...messages.allStatuses} />
        </Menu.Item>
        <Divider />
        {(statuses as (IIdeaStatusData | IInitiativeStatusData)[]).map(
          (status) => (
            <FilterSidebarStatusesItem
              key={status.id}
              status={status}
              active={isActive(status.id)}
              onClick={handleItemClick(status.id)}
            />
          )
        )}
      </Menu>
    );
  }

  return null;
};

export default FilterSidebarStatuses;
