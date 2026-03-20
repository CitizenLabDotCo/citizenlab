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

import AddModerator from 'components/admin/AddModerator';
import { Section } from 'components/admin/Section';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

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
      <AddModerator
        projectId={projectId}
        onAddModerator={async ({ moderatorId, moderatorEmail }) => {
          if (moderatorId) {
            await addProjectModerator({ moderatorId, projectId });
          } else {
            await addProjectModerator({ moderatorEmail, projectId });
          }
        }}
      />
    </ModeratorSubSection>
  );
};

export default ProjectManagement;
