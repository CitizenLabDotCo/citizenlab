import React from 'react';

import {
  IconTooltip,
  Box,
  Title,
  Text,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAddProjectModerator from 'api/project_moderators/useAddProjectModerator';
import useDeleteProjectModerator from 'api/project_moderators/useDeleteProjectModerator';
import useProjectModerators from 'api/project_moderators/useProjectModerators';

import AddModerator from 'components/admin/AddModerator';
import ModeratorsTable from 'components/admin/ModeratorsTable';
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
  const { data: projectModerators } = useProjectModerators({ projectId });
  const { mutateAsync: addProjectModerator } = useAddProjectModerator();
  const { mutateAsync: deleteProjectModerator } = useDeleteProjectModerator();

  const handleDeleteModerator = async (userId: string) => {
    await deleteProjectModerator({ projectId, userId });
  };

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
        {formatMessage(messages.addProjectManagers)}
      </Text>
      <AddModerator
        projectId={projectId}
        onAddModerator={async (params) => {
          await addProjectModerator({ ...params, projectId });
        }}
      />
      {projectModerators && (
        <Box mt="20px">
          <ModeratorsTable
            moderators={projectModerators.data}
            onDeleteModerator={handleDeleteModerator}
          />
        </Box>
      )}
    </ModeratorSubSection>
  );
};

export default ProjectManagement;
