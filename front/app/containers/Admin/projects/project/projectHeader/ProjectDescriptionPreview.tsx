import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import useProjectDescriptionBuilderLayout from 'api/project_description_builder/useProjectDescriptionBuilderLayout';
import { IProject } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isEmptyMultiloc } from 'utils/helperUtils';
import { stripHtml } from 'utils/textUtils';

import messages from './messages';

interface Props {
  project: IProject;
}

const EditDescriptionLinkContent = () => {
  const { formatMessage } = useIntl();

  return (
    <Text color="coolGrey600" m="0px" fontSize="s" p="0">
      <Box display="flex" alignItems="center" gap="4px">
        <Icon name="edit" fill={colors.coolGrey600} width="16px" />
        {formatMessage(messages.editDescription)}
      </Box>
    </Text>
  );
};

const ProjectDescriptionPreview = ({ project }: Props) => {
  const projectId = project.data.id;
  const localize = useLocalize();
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
      {/* Given the wide range of elements the content builder provides, it's hard to show a reliable preview. 
      Hence we show the "Edit description" text when we use the content builder. */}
      <EditDescriptionLinkContent />
    </Link>
  ) : (
    <Link
      data-cy="e2e-project-description-preview-link-to-multiloc-settings"
      to={`/admin/projects/${projectId}/settings/description`}
    >
      {isEmptyMultiloc(project.data.attributes.description_multiloc) ? (
        <EditDescriptionLinkContent />
      ) : (
        <Text color="coolGrey600" m="0px" fontSize="s" p="0">
          {stripHtml(
            localize(project.data.attributes.description_multiloc),
            100
          )}
        </Text>
      )}
    </Link>
  );
};

export default ProjectDescriptionPreview;
