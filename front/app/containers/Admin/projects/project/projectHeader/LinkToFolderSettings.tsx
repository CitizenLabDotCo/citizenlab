import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

import useProjectFolderById from 'api/project_folders/useProjectFolderById';

import useLocalize from 'hooks/useLocalize';

import Link from 'utils/cl-router/Link';

interface Props {
  folderId: string;
}

const LinkToFolderSettings = ({ folderId }: Props) => {
  const { data: projectFolder } = useProjectFolderById(folderId);
  const localize = useLocalize();

  if (!projectFolder) return null;

  return (
    <Link to={`/admin/projects/folders/${folderId}`}>
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
