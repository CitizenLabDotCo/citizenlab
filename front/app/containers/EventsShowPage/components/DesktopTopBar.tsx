import React from 'react';

// components
import { Box, Button, isRtl } from '@citizenlab/cl2-component-library';
import GoBackButtonSolid from 'components/UI/GoBackButton/GoBackButtonSolid';

// router
import clHistory from 'utils/cl-router/history';

// styling
import styled from 'styled-components';

// typings
import { IProjectData } from 'api/projects/types';
import { useLocation } from 'react-router-dom';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

// api
import useAuthUser from 'api/me/useAuthUser';
import { IEventData } from 'api/events/types';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

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
  event: IEventData;
}

const TopBar = ({ project, event }: Props) => {
  const location = useLocation();
  const { data: authUser } = useAuthUser();
  const { formatMessage } = useIntl();

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
        {authUser && canModerateProject(project, authUser) && (
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
