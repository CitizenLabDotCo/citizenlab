import React from 'react';

import { SupportedLocale } from 'typings';

import { ContentBuildableType } from 'api/content_builder/types';

import FolderDescriptionBuilderToolbox from 'components/DescriptionBuilder/DescriptionBuilderToolbox/FolderDescriptionBuilderToolbox';
import ProjectDescriptionBuilderToolbox from 'components/DescriptionBuilder/DescriptionBuilderToolbox/ProjectDescriptionBuilderToolbox';

type DescriptionBuilderToolboxProps = {
  selectedLocale: SupportedLocale;
  contentBuildableId: string;
  contentBuildableType: ContentBuildableType;
};

const DescriptionBuilderToolbox = ({
  selectedLocale,
  contentBuildableId,
  contentBuildableType,
}: DescriptionBuilderToolboxProps) => {
  // Folder
  if (contentBuildableType === 'folder') {
    return (
      <FolderDescriptionBuilderToolbox
        selectedLocale={selectedLocale}
        folderId={contentBuildableId}
      />
    );
  }

  // Project
  return <ProjectDescriptionBuilderToolbox />;
};

export default DescriptionBuilderToolbox;
