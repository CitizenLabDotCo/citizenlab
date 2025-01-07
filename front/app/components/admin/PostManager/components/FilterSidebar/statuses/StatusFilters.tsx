import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import useAuthUser from 'api/me/useAuthUser';

import Divider from 'components/admin/Divider';
import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import { ManagerType } from '../../..';
import messages from '../../../messages';

import StatusButton from './StatusButton';
import StatusFilterItem from './StatusFilterItem';

interface Props {
  type: ManagerType;
  statuses: IIdeaStatusData[];
  selectedStatus?: string;
  onChangeStatusFilter: (status: string | null) => void;
}

const StatusFilters = ({
  statuses,
  selectedStatus,
  onChangeStatusFilter,
  type,
}: Props) => {
  const { data: authUser } = useAuthUser();

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

  return (
    <Box display="flex" flexDirection="column">
      <StatusButton onClick={clearFilter} active={!selectedStatus}>
        <FormattedMessage {...messages.allStatuses} />
      </StatusButton>
      <Divider />
      {/* Input statuses can be edited and only admins can do this */}
      {isAdmin(authUser) && (
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
      {statuses.map((status) => (
        <StatusFilterItem
          key={status.id}
          status={status}
          active={isActive(status.id)}
          onClick={() => handleItemClick(status.id)}
        />
      ))}
    </Box>
  );
};

export default StatusFilters;
