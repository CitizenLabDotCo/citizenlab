import React from 'react';

import { Box, Button, isRtl } from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import GoBackButtonSolid from 'components/UI/GoBackButton/GoBackButtonSolid';

// router
import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isAdmin, isProjectModerator } from 'utils/permissions/roles';

import { IEventData } from 'api/events/types';
import useAuthUser from 'api/me/useAuthUser';
import { IProjectData } from 'api/projects/types';

import messages from '../messages';

const Bar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;
interface Props {
  project: IProjectData;
  event?: IEventData;
}

const TopBar = ({ project, event }: Props) => {
  const location = useLocation();
  const user = useAuthUser();
  const { formatMessage } = useIntl();
  const isAdminUser = isAdmin(user.data);
  const isModerator = isProjectModerator(user.data, project.id);

  return (
    <Bar>
      <Box mb="40px" display="flex" width="100%" justifyContent="space-between">
        <GoBackButtonSolid
          text={formatMessage(messages.goBack)}
          onClick={() => {
            const hasGoBackLink = location.key !== 'default';
            hasGoBackLink
              ? clHistory.goBack()
              : clHistory.push(`/projects/${project.attributes.slug}`);
          }}
        />
        {(isAdminUser || isModerator) && event && (
          <Button
            buttonStyle="secondary"
            m="0px"
            icon="edit"
            px="8px"
            py="4px"
            text={formatMessage(messages.editEvent)}
            onClick={() => {
              clHistory.push(
                `/admin/projects/${project.id}/settings/events/${event.id}`
              );
            }}
          />
        )}
      </Box>
    </Bar>
  );
};

export default TopBar;
