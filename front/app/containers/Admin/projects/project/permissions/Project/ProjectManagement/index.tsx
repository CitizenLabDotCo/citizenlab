import React from 'react';

import {
  IconTooltip,
  Box,
  Title,
  Text,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import useAddProjectModerator from 'api/project_moderators/useAddProjectModerator';

import AddByEmail from 'components/admin/AddByEmail';
import ModeratorList from 'components/admin/ModeratorList/ModeratorList';
import UserSearch from 'components/admin/ModeratorUserSearch';
import SeatInfo from 'components/admin/SeatBasedBilling/SeatInfo';
import { Section } from 'components/admin/Section';
import Or from 'components/UI/Or';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import messages from './messages';

const ModeratorSubSection = styled(Section)`
  margin-bottom: 30px;
`;

const StyledA = styled.a`
  &:hover {
    text-decoration: underline;
  }
`;

interface Props {
  projectId: string;
}

const TEMP_HIDE_STUFF = Math.random() > -1;

const ProjectManagement = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const { mutateAsync: addProjectModerator } = useAddProjectModerator();

  return (
    <ModeratorSubSection>
      <Box display="flex" mb="16px">
        <Title my="0px" mr="4px" variant="h2" color="primary">
          <FormattedMessage {...messages.projectManagementTitle} />
        </Title>
        <IconTooltip
          mt="4px"
          content={
            <FormattedMessage
              {...messages.projectManagerTooltipContent}
              values={{
                moderationInfoCenterLink: (
                  <StyledA
                    href={formatMessage(messages.moreInfoModeratorLink2)}
                    target="_blank"
                  >
                    <FormattedMessage
                      {...messages.moderationInfoCenterLinkText}
                    />
                  </StyledA>
                ),
              }}
            />
          }
        />
      </Box>
      <Text
        color="primary"
        p="0px"
        mb="32px"
        style={{ fontWeight: '500', fontSize: '18px' }}
      >
        {formatMessage(messages.addProjectModerators)}
      </Text>
      {isAdmin(authUser) && (
        <>
          <UserSearch projectId={projectId} />
          {TEMP_HIDE_STUFF && (
            <Box maxWidth="500px" mt="28px">
              <Or />
            </Box>
          )}
        </>
      )}
      {TEMP_HIDE_STUFF && (
        <AddByEmail
          onSubmit={async (email) => {
            await addProjectModerator({ moderatorEmail: email, projectId });
          }}
        />
      )}
      <Box mt="40px">
        <Text
          color="primary"
          p="0px"
          mb="32px"
          style={{ fontWeight: '500', fontSize: '18px' }}
        >
          {formatMessage(messages.moderatorSearchFieldLabel)}
        </Text>
        <ModeratorList projectId={projectId} />
      </Box>
      <Box width="516px">
        <SeatInfo seatType="moderator" />
      </Box>
    </ModeratorSubSection>
  );
};

export default ProjectManagement;
