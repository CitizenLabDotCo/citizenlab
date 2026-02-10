import React from 'react';

import { Title } from '@citizenlab/cl2-component-library';
import { UserComponent } from '@craftjs/core';

import useProjectFolderById from 'api/project_folders/useProjectFolderById';

import useLocalize from 'hooks/useLocalize';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';

import messages from './messages';

interface Props {
  folderId: string;
}
const FolderTitle: UserComponent = ({ folderId }: Props) => {
  const localize = useLocalize();
  const { data: projectFolder } = useProjectFolderById(folderId);
  const craftComponentDefaultPadding = useCraftComponentDefaultPadding();

  if (!projectFolder) {
    return null;
  }

  return (
    <Title color="tenantText" variant="h1" px={craftComponentDefaultPadding}>
      {localize(projectFolder.data.attributes.title_multiloc)}
    </Title>
  );
};

FolderTitle.craft = {
  custom: {
    title: messages.folderTitle,
  },
};

export const folderTitleTitle = messages.folderTitle;

export default FolderTitle;
