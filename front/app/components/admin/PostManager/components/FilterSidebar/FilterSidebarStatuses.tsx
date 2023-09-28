import React from 'react';
import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IInitiativeStatusData } from 'api/initiative_statuses/types';
import { Menu, Divider } from 'semantic-ui-react';
import FilterSidebarStatusesItem from './FilterSidebarStatusesItem';
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import useAuthUser from 'api/me/useAuthUser';
import messages from '../../messages';
import { ManagerType } from '../..';
import { isAdmin } from 'utils/permissions/roles';

interface Props {
  type: ManagerType;
  statuses?: IIdeaStatusData[] | IInitiativeStatusData[] | null;
  selectedStatus?: string | null;
  onChangeStatusFilter?: (status: string | null) => void;
}

const FilterSidebarStatuses = ({
  statuses,
  selectedStatus,
  onChangeStatusFilter,
  type,
}: Props) => {
  const { data: authUser } = useAuthUser();

  if (isNilOrError(authUser)) {
    return null;
  }

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
        {/* Only input statuses can be edited and only admins can do this */}
        {isAdmin({ data: authUser.data }) &&
          (type === 'AllIdeas' ||
            (type === 'ProjectIdeas' && (
              <Box display="inline-flex">
                <Button
                  buttonStyle="text"
                  icon="edit"
                  pl="12px"
                  linkTo="/admin/settings/statuses"
                  iconPos="right"
                  iconSize="14px"
                >
                  <Text
                    m="0px"
                    color="coolGrey600"
                    fontSize="s"
                    textAlign="left"
                  >
                    <FormattedMessage {...messages.editStatuses} />
                  </Text>
                </Button>
              </Box>
            )))}
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
