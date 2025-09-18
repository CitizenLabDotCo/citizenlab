import React, { useState } from 'react';

import {
  Box,
  Button,
  Icon,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';

import useProjectFolderById from 'api/project_folders/useProjectFolderById';

import useLocalize from 'hooks/useLocalize';

import { createHighlighterLink } from 'components/Highlighter';

import Link from 'utils/cl-router/Link';
import { truncate } from 'utils/textUtils';

import LinkToFolderProjectDropdown from './LinkToFolderProjectDropdown';

interface Props {
  folderId: string;
  projectId: string;
}

export const fragmentId = 'folder';
const LinkToFolderSettings = ({ folderId, projectId }: Props) => {
  const { data: projectFolder } = useProjectFolderById(folderId);
  const [isProjectListOpen, setIsProjectListOpen] = useState(false);

  const localize = useLocalize();

  if (!projectFolder) return null;

  return (
    <Box position="relative">
      <Box display="flex">
        <Link
          to={createHighlighterLink(
            `/admin/projects/${projectId}/settings#${fragmentId}`
          )}
          data-cy="e2e-folder-preview-link-to-settings"
        >
          <Box display="flex" alignItems="center" gap="4px">
            <Icon name="folder-solid" fill={colors.coolGrey600} width="14px" />
            <Text color="coolGrey600" m="0px" fontSize="s" p="0">
              {truncate(
                localize(projectFolder.data.attributes.title_multiloc),
                40
              )}
            </Text>
          </Box>
        </Link>
        <Button
          onClick={() => {
            setIsProjectListOpen(!isProjectListOpen);
          }}
          data-cy="e2e-folder-preview-button"
          buttonStyle="text"
          iconSize="20px"
          p="0px"
          ml="4px"
          icon={isProjectListOpen ? 'chevron-up' : 'chevron-down'}
        />
        <LinkToFolderProjectDropdown
          folderId={folderId}
          isProjectListOpen={isProjectListOpen}
          setIsProjectListOpen={setIsProjectListOpen}
        />
      </Box>
    </Box>
  );
};

export default LinkToFolderSettings;
