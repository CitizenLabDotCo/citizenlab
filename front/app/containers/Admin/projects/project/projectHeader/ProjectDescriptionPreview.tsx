import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import useProjectDescriptionBuilderLayout from 'api/project_description_builder/useProjectDescriptionBuilderLayout';
import { IProject } from 'api/projects/types';

import { createHighlighterLink } from 'components/Highlighter';

import { useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from './messages';

interface Props {
  project: IProject;
}

const EditDescriptionLinkContent = () => {
  const { formatMessage } = useIntl();

  return (
    <Box display="flex" alignItems="center" gap="4px">
      <Icon name="edit" fill={colors.coolGrey600} width="16px" />
      <Text color="coolGrey600" m="0px" fontSize="s" p="0">
        {formatMessage(messages.editDescription)}
      </Text>
    </Box>
  );
};
export const fragmentId = 'description-multiloc';
const ProjectDescriptionPreview = ({ project }: Props) => {
  const projectId = project.data.id;
  const { data: projectDescriptionBuilderLayout } =
    useProjectDescriptionBuilderLayout(projectId);
  const projectDescriptionBuilderEnabled =
    projectDescriptionBuilderLayout?.data.attributes.enabled || false;

  return projectDescriptionBuilderEnabled ? (
    <Link
      data-cy="e2e-project-description-preview-link-to-content-builder"
      to={
        // The project description content builder route has not been added to the type yet
        // so we need to cast it to RouteType
        `/admin/project-description-builder/projects/${projectId}/description` as RouteType
      }
    >
      <EditDescriptionLinkContent />
    </Link>
  ) : (
    <Link
      data-cy="e2e-project-description-preview-link-to-multiloc-settings"
      to={createHighlighterLink(
        `/admin/projects/${projectId}/general#${fragmentId}`
      )}
    >
      <EditDescriptionLinkContent />
    </Link>
  );
};

export default ProjectDescriptionPreview;
