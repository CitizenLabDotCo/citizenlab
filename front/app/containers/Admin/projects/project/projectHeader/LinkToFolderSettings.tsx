import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

import useProjectFolderById from 'api/project_folders/useProjectFolderById';

import useLocalize from 'hooks/useLocalize';

import { createHighlighterLink } from 'components/Highlighter';

import Link from 'utils/cl-router/Link';

interface Props {
  folderId: string;
  projectId: string;
}
export const fragmentId = 'folder';
const LinkToFolderSettings = ({ folderId, projectId }: Props) => {
  const { data: projectFolder } = useProjectFolderById(folderId);
  const localize = useLocalize();
  const linkTo = createHighlighterLink(
    `/admin/projects/${projectId}/settings#${fragmentId}`
  );

  if (!projectFolder) return null;

  return (
    <Link to={linkTo} data-cy="e2e-folder-preview-link-to-settings">
      <Box display="flex" alignItems="center" gap="4px">
        <Icon name="folder-solid" fill={colors.coolGrey600} width="14px" />
        <Text color="coolGrey600" m="0px" fontSize="s" p="0">
          {localize(projectFolder.data.attributes.title_multiloc)}
        </Text>
      </Box>
    </Link>
  );
};

export default LinkToFolderSettings;
