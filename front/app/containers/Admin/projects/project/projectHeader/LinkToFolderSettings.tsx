import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

import useProjectFolderById from 'api/project_folders/useProjectFolderById';

import useLocalize from 'hooks/useLocalize';

import { createHighlighterLink } from 'components/Highlighter';

import Link from 'utils/cl-router/Link';
import { truncate } from 'utils/textUtils';

interface Props {
  folderId: string;
  projectId: string;
}

export const fragmentId = 'folder';
const LinkToFolderSettings = ({ folderId, projectId }: Props) => {
  const { data: projectFolder } = useProjectFolderById(folderId);
  const localize = useLocalize();

  if (!projectFolder) return null;

  return (
    <Link
      to={createHighlighterLink(
        `/admin/projects/${projectId}/settings#${fragmentId}`
      )}
      data-cy="e2e-folder-preview-link-to-settings"
    >
      <Box display="flex" alignItems="center" gap="4px">
        <Icon name="folder-solid" fill={colors.coolGrey600} width="14px" />
        <Text color="coolGrey600" m="0px" fontSize="s" p="0">
          {truncate(localize(projectFolder.data.attributes.title_multiloc), 40)}
        </Text>
      </Box>
    </Link>
  );
};

export default LinkToFolderSettings;
