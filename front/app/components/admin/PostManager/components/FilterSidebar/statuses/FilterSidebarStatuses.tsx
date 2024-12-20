import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { Menu, Divider } from 'semantic-ui-react';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import useAuthUser from 'api/me/useAuthUser';

import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { isAdmin } from 'utils/permissions/roles';

import { ManagerType } from '../../..';
import messages from '../../../messages';

import FilterSidebarStatusesItem from './FilterSidebarStatusesItem';

interface Props {
  type: ManagerType;
  statuses?: IIdeaStatusData[] | null;
  selectedStatus?: string | null;
  onChangeStatusFilter: (status: string | null) => void;
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

  const handleItemClick = (id: string) => {
    onChangeStatusFilter(id);
  };

  const clearFilter = () => {
    onChangeStatusFilter(null);
  };

  const isActive = (id: string) => {
    return selectedStatus === id;
  };

  const linkToStatusSettings =
    type === 'AllIdeas' || type === 'ProjectIdeas'
      ? '/admin/settings/ideation/statuses'
      : '/admin/settings/proposals/statuses';

  if (!isNilOrError(statuses)) {
    return (
      <Menu secondary={true} vertical={true} fluid={true}>
        <Menu.Item onClick={clearFilter} active={!selectedStatus}>
          <FormattedMessage {...messages.allStatuses} />
        </Menu.Item>
        <Divider />
        {/* Input statuses can be edited and only admins can do this */}
        {isAdmin(authUser) &&
          (type === 'AllIdeas' ||
            type === 'ProjectIdeas' ||
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            type === 'ProjectProposals') && (
            <Box display="inline-flex">
              <Button
                buttonStyle="text"
                icon="edit"
                pl="12px"
                linkTo={linkToStatusSettings}
                iconPos="right"
                iconSize="14px"
              >
                <Text m="0px" color="coolGrey600" fontSize="s" textAlign="left">
                  <FormattedMessage {...messages.editStatuses} />
                </Text>
              </Button>
            </Box>
          )}
        {(statuses as IIdeaStatusData[]).map((status) => (
          <FilterSidebarStatusesItem
            key={status.id}
            status={status}
            active={isActive(status.id)}
            onClick={() => handleItemClick(status.id)}
          />
        ))}
      </Menu>
    );
  }

  return null;
};

export default FilterSidebarStatuses;
